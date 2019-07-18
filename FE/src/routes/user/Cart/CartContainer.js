import React, { useState, useEffect } from 'react';
import CartPresenter from './CartPresenter';

// const useCart = (initCart) => {
//   const [cart, setStateCart] = useState(initCart);

//   const setAllCart = (newCart) => {
//     console.log(newCart);
//     setStateCart(newCart);
//     // 여기에 로컬 스토리지 업데이트
//   };

//   return { cart, setAllCart };
// };

const CartContainer = () => {
  const [cart, setStateCart] = useState([
    { menuName: '아메리카노', menuId: 1, menuPrice: 1000 },
    { menuName: '아포카도', menuId: 2, menuPrice: 1000 },
    { menuName: '카페라떼', menuId: 3, menuPrice: 3000 },
  ]);
  const hello = () => console.log('hello');
  useEffect(hello, [cart]);

  return <CartPresenter cart={cart} setStateCart={setStateCart} />;
};

export default CartContainer;
