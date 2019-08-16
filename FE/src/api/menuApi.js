import fetchClient from './axios';

const axios = fetchClient();

// name, price, information, imageFile(src)
export const getMenuList = ({ itemSize, page }) =>
  axios.get(`api/menus?page=${page}&size=${itemSize}`);

export const deleteMenuList = id => axios.delete(`api/menus/${id}`);

export const createMenuList = item => {
  return axios.post('api/menus', item, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateMenuList = (id, item) =>
  axios.put(`api/menus/${id}`, item, { headers: { 'Content-Type': 'multipart/form-data' } });

export const searchMenu = (menuName, page = 0, size = 20) =>
  axios.get(`api/menus/search?page=${page}&size=${size}&menu_name=${menuName}`);

export const getRankApi = () => axios.get('api/statistics/orders/rank');
