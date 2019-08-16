import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import propTypes from 'prop-types';
import '../styles/MenuManagePopup.scss';
import inputImgPreview from '../../../../utils/inputImgPreview';
import { isSpecial, trimStr } from '../../../../utils/validateText';
import imgCompression from '../../../../utils/imgCompression';

const MenuManagePopup = ({ menuPopupData, updateItem, createItem, setIsPopup }) => {
  const { id, name, price, information, imageFile } = menuPopupData;
  const [popupName, setPopupName] = useState('');
  const [popupPrice, setPopupPrice] = useState('');
  const [popupInformation, setPopupInformation] = useState('');
  const [popupFile, setPopupFile] = useState(null);
  const [isCompression, setIsCompression] = useState(false);
  const isEdit = Object.keys(menuPopupData).length > 1;
  const inputImgRef = useRef(null); // 인풋 미리보기 img 태그
  const fileInputRef = useRef(null); // 파일 input 태그

  const inputImgCallback = useCallback(
    e => {
      if (!imgTypeValidate(e.target)) {
        e.target.files = undefined;
        e.target.value = '';
        return false;
      }
      setIsCompression(prev => !prev);
      imgCompression(e, file => {
        inputImgPreview(fileInputRef.current, inputImgRef.current);
        setPopupFile(file);
        setIsCompression(prev => !prev);
      });
    },
    [setIsCompression, setPopupFile],
  );

  // 이미지 압축시 dim 띄우는 useMemo
  const compressionDim = useMemo(() => {
    return (
      isCompression && (
        <div className="compressionDim">
          <div className="dimContents">
            <img src="https://www.gaitame.com/img/dojo/loader.gif" alt="압축중" />
            <p>이미지 압축중...</p>
          </div>
        </div>
      )
    );
  }, [isCompression]);

  // 제출버튼 callback
  const onSubmitCallback = useCallback(
    e => {
      e.preventDefault();
      if (popupName && popupPrice && popupInformation) {
        // 서버와 통신하지 않고 이미지를 바로 리스트에 올리기 위한 fakeImg 지정
        const fakeImg = inputImgRef.current.getAttribute('src');
        const ZERO = 0; // 서버 배포 에러를 막기 위한 상수 지정
        const trimedName = trimStr(popupName);
        const trimedPrice = `${parseInt(popupPrice)}`;
        const currentImgSize = fileInputRef.current.files[0]
          ? fileInputRef.current.files[0].size
          : ZERO;
        const maxImgSize = 1 * 1024 * 1024; // 이미지 최대용량 설정 MB단위

        // 상품명엔 특수문자 포함 할 수 없음
        if (isSpecial(popupName)) {
          alert('제목에 특수문자를 포함 할 수 없습니다');
          return false;
        }
        // 메뉴 글자수 제한
        if (popupName.length > 15) {
          alert('상품명 최대 글자수 14글자를 넘겼습니다');
          return false;
        }
        // 메뉴 금액제한 최대금액 1억 ...
        if (popupPrice > 100000000) {
          alert('상품 최대 금액 초과');
          return false;
        }
        // 이미지 사이즈 제한
        if (currentImgSize > maxImgSize) {
          alert(`이미지 사이즈는 ${maxImgSize / 1024 / 1024} MB 로 제한됩니다`);
          return false;
        }

        // 폼데이터 담기 수정일때 / 추가일때
        const formData = new FormData();
        if (isEdit && !fileInputRef.current.files[0]) {
          formData.append('name', trimedName);
          formData.append('price', trimedPrice);
          formData.append('information', popupInformation);
        } else {
          formData.append('name', trimedName);
          formData.append('price', trimedPrice);
          formData.append('information', popupInformation);
          formData.append('imageFile', popupFile);
        }

        // 폼데이터 전송 수정일때 / 추가일때
        if (isEdit) {
          updateItem(formData, id, fakeImg);
          setIsPopup(false);
        } else {
          if (popupFile) {
            createItem(formData, fakeImg);
            setIsPopup(false);
          } else {
            alert('이미지를 넣어주세요');
          }
        }
      } else {
        alert('내용을 마저 채워주세요');
      }
    },
    [
      popupName,
      popupPrice,
      popupInformation,
      popupFile,
      createItem,
      id,
      isEdit,
      setIsPopup,
      updateItem,
    ],
  );

  // 팝업 내용을 초기화 해 줌
  useEffect(() => {
    if (isEdit) {
      // 수정모드 init
      setPopupName(name);
      setPopupPrice(String(price));
      setPopupInformation(information);
      setPopupFile(null);
      inputImgRef.current.setAttribute('src', imageFile);
    } else {
      // 추가모드 init
      setPopupName('');
      setPopupPrice('');
      setPopupInformation('');
      setPopupFile(null);
      inputImgRef.current.setAttribute('src', ''); // 이미지 미리보기 초기화
    }
  }, [menuPopupData, imageFile, information, isEdit, name, price]);

  // input file form에 들어간 이미지 validation
  const imgTypeValidate = obj => {
    const file_kind = obj.value.lastIndexOf('.');
    const file_name = obj.value.substring(file_kind + 1, obj.length);
    const file_type = file_name.toLowerCase();

    const check_file_type = ['jpg', 'gif', 'png', 'jpeg', 'bmp'];

    if (check_file_type.indexOf(file_type) == -1) {
      alert('이미지 파일만 선택할 수 있습니다.');
      return false;
    }
    return true;
  };

  return (
    <div className="MenuManagePopup" onClick={e => e.stopPropagation()}>
      <input
        type="button"
        value="x"
        className="closeBtn"
        onClick={() => {
          setIsPopup(false);
        }}
      />
      <h1>{isEdit ? '수정' : '추가'}</h1>
      <form
        encType="multipart/form-data"
        className="MenuManageForm"
        onSubmit={e => onSubmitCallback(e)} // 폼 서브밋
      >
        <div className="nameArea inputArea">
          <div className="areaTitle">상품명</div>
          <input
            type="text"
            value={popupName}
            onChange={e => setPopupName(e.target.value)}
            className="nameInput"
          />
        </div>
        <div className="priceArea inputArea">
          <div className="areaTitle">가격</div>
          <input
            type="number"
            value={popupPrice}
            onChange={e => setPopupPrice(e.target.value)}
            className="priceInput"
          />
        </div>
        <div className="informationArea inputArea">
          <div className="areaTitle">설명</div>
          <textarea
            value={popupInformation}
            onChange={e => setPopupInformation(e.target.value)}
            className="informationInput"
          />
        </div>
        <div className="imgInputArea inputArea">
          <div className="areaTitle">이미지</div>
          <input
            type="file"
            className="fileInput"
            ref={fileInputRef}
            accept="image/gif, image/jpeg, image/png"
            onChange={inputImgCallback}
          />
          <div className="previewImgWrap">
            <img src="" alt="" ref={inputImgRef} className="imgInput" />
          </div>
          <input type="submit" value="저  장" className="submitPopup" />
        </div>
      </form>
      {compressionDim}
    </div>
  );
};

MenuManagePopup.defaultProps = {
  menuPopupData: {},
  updateItem: () => {},
  createItem: () => {},
  setIsPopup: () => {},
};

MenuManagePopup.propTypes = {
  menuPopupData: propTypes.objectOf(propTypes.oneOfType([propTypes.string, propTypes.number])),
  updateItem: propTypes.func,
  createItem: propTypes.func,
  setIsPopup: propTypes.func,
};

export default MenuManagePopup;
