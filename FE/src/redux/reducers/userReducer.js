import {
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  SIGNIN_FAILURE,
  SIGNIN_SUCCESS,
  SIGNIN_REQUEST,
  LOG_OUT,
  SIGNIN_POPUP_CHANGE,
  SIGNUP_FINISH,
  CHANGE_POINT_SUCCESS,
} from '../actions/userAction';

const initState = {
  isSigningIn: false,
  isSignedIn: !!localStorage.getItem('USER') || !!sessionStorage.getItem('USER'), // 더미
  signInErrorReason: '',
  isSigningOut: false,
  isSigningUp: false,
  isSignedUp: false,
  signUpErrorReason: '',
  signInPopup: false, // 로그인 팝업창 띄울지 말지
  me: (localStorage.getItem('USER') && JSON.parse(localStorage.getItem('USER'))) ||
    (sessionStorage.getItem('USER') && JSON.parse(sessionStorage.getItem('USER'))) || {
      id: -1,
      memberId: '',
      memberRole: 'NORMAL',
      point: 0,
      jwt: null,
      lastSignInTime: null,
    },
};

const userReducer = (state = initState, action) => {
  switch (action.type) {
    case SIGNUP_REQUEST: {
      return {
        ...state,
        isSigningUp: true,
        isSignedUp: false,
        signUpErrorReason: '',
      };
    }
    case SIGNUP_SUCCESS: {
      return { ...state, isSigningUp: false, isSignedUp: true };
    }
    case SIGNUP_FAILURE: {
      return { ...state, isSigningUp: false, signUpErrorReason: action.error };
    }
    case SIGNUP_FINISH: {
      return { ...state, isSignedUp: false };
    }

    case SIGNIN_REQUEST: {
      return {
        ...state,
        isSigningIn: true,
        isSignedIn: false,
        signInErrorReason: '',
      };
    }
    case SIGNIN_SUCCESS: {
      return {
        ...state,
        isSigningIn: false,
        isSignedIn: true,
        signInPopup: state.signInPopup && false, // true 일때만 변경되도록 수정
        me: { ...action.data },
      };
    }
    case SIGNIN_FAILURE: {
      return { ...state, isSigningIn: false, signInErrorReason: action.error };
    }
    case SIGNIN_POPUP_CHANGE: {
      return { ...state, signInPopup: !state.signInPopup };
    }
    case CHANGE_POINT_SUCCESS: {
      if (state.me.point === action.data) {
        return state;
      }
      return { ...state, me: { ...state.me, point: action.data } };
    }
    case LOG_OUT: {
      return {
        ...state,
        isSignedIn: false,
        me: {
          id: -1,
          memberId: '',
          memberRole: 'NORMAL',
          point: 0,
          jwt: null,
          lastSignInTime: null,
        },
      };
    }

    default:
      return state;
  }
};

export default userReducer;
