import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { setChangedOrderAction } from '../redux/actions/orderAction';
import WsMsgPop from './WsMsgPop';
import { userOrderAPI } from '../api/userApi';
import { useTokenCheck } from '../utils/tokenCheck';

const GlobalWs = withRouter(() => {
  const { isSignedIn, me } = useSelector(state => state.user);
  const { sendOrderState, wsConnect } = useSelector(state => state.order);
  const [isConnect, setIsConnect] = useState(false);
  const [popMsg, setPopMsg] = useState('');
  const [isPopup, setIsPopup] = useState(false);
  const dispatch = useDispatch();
  const [wscl, setwscl] = useState(null);
  const { tokenCheck } = useTokenCheck();

  // 인증 토큰은 로그인 될 때 마다 localStorage에 저장, 저장된 토큰을 꺼내 쓰는 함수
  const token = () => {
    const localToken = localStorage.getItem('TOKEN');
    const sessionToken = sessionStorage.getItem('TOKEN');
    return localToken ? `Bearer ${localToken}` : '' || sessionToken ? `Bearer ${sessionToken}` : '';
  };

  const wsErrorCallback = err => {
    tokenCheck(err);
  };

  // ws 연결을 시도하는 함수
  const socketOrderInit = () => {
    // 웹소켓 정의
    const wsclient = Stomp.over(new SockJS('/teamonion', null, {}));
    wsclient.debug = null;
    setwscl(wsclient);
    wsclient.connect(
      { Authorization: token() },
      frame => {
        setIsConnect(true);
        // 일반유저일 때 구독
        if (me.memberRole === 'NORMAL') {
          wsclient.subscribe('/user/queue/orders/update', msg => {
            setIsPopup(false);
            const res = msg.body && JSON.parse(msg.body);
            dispatch(setChangedOrderAction(res));
            if (res.made && !res.pickup) {
              setPopMsg(res);
            }
            // 마지막 주문이라면 연결을 끊는다
            if (res.last) {
              setIsConnect(false);
              wsclient.disconnect();
            }
          });
          // 관리자 일 때 구독
        } else if (me.memberRole === 'ADMIN') {
          // 메뉴 추가시 동작
          wsclient.subscribe('/topic/orders/add', msg => {
            setIsPopup(false);
            const res = JSON.parse(msg.body);
            dispatch(setChangedOrderAction(res));
            setPopMsg(res);
          });
          // 관리자 상태 변경 메시지 받을때 동작
          wsclient.subscribe('/topic/orders/update', msg => {
            const res = JSON.parse(msg.body);
            dispatch(setChangedOrderAction(res));
          });
        }
      },
      wsErrorCallback,
    );
  };

  // redux 상태 wsConnect를 이용하여 연결을 관리하고자 함, 첫 false 일 때 disconnect를 막아야 한다.
  useEffect(() => {
    if (wsConnect && !isConnect) {
      socketOrderInit();
    } else if (!wsConnect && isConnect) {
      setIsConnect(false);
      if (wscl) wscl.disconnect();
    }
  }, [wsConnect]);

  // 관리자 state 변경내역을 redux state로 받아 send
  useEffect(() => {
    if (Object.keys(sendOrderState).length > 0) {
      if (wscl)
        wscl.send('/api/orders/update', { Authorization: token() }, JSON.stringify(sendOrderState));
    }
  }, [sendOrderState]);

  // isPopup 상태에 따라 알림메시지 팝업을 반환 하는 함수
  const wsPopup = useMemo(() => {
    return isPopup && <WsMsgPop popMsg={popMsg} setIsPopup={setIsPopup} />;
  }, [isPopup]);

  // popup msg가 있다면 isPopup를 true로 바꿔 팝업을 띄우게 함
  useEffect(() => {
    popMsg && setIsPopup(true);
  }, [popMsg]);

  // 주문 있는지 없는지 체크 있으면 콜백 실행
  const checkOrder = callback => {
    const fetchMyOrder = async () => {
      try {
        if (me) {
          const {
            data: { content },
          } = await userOrderAPI(me.id, false);
          if (content.length > 0 || me.memberRole === 'ADMIN') callback();
        }
      } catch (e) {
        tokenCheck(e);
      }
    };
    fetchMyOrder();
  };

  // 매 로그인 여부 변경시마다 동작, 로그인과 연결 상태에 따라 연결을 맺고 끊는다.
  useEffect(() => {
    if (isSignedIn && !isConnect) {
      checkOrder(socketOrderInit); // 주문 있으면 ws연결
    } else if (!isSignedIn && isConnect) {
      setIsConnect(false);
      if (wscl) wscl.disconnect();
    }
  }, [isSignedIn]);

  return <div className="wsPresenter">{wsPopup}</div>;
});

export default GlobalWs;
