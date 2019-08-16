import React, { useState, useEffect } from 'react';
import MainPresenter from './MainPresenter';
import { getMenuList, searchMenu, getRankApi } from '../../../api/menuApi';
import changeImagePath from '../../../utils/changeImagePath';

const MainContainer = () => {
  const [storeList, setStoreList] = useState([]);
  const [menuDetailData, setMenuDetailData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [menuPageData, setMenuPageData] = useState({});
  const [searchText, setSearchText] = useState('');
  const [rankData, setRankData] = useState([]);
  // 상품상세 레이어 팝업에 데이터를 전달하기 위한 콜백
  const mapDetailData = data => {
    setMenuDetailData(data);
  };

  const searchMenuListByName = async (menuName, page = 0, itemSize = 12) => {
    try {
      const res = await searchMenu(menuName, page, itemSize);
      const { content, totalPages } = res.data;
      const newContent = changeImagePath(content);
      setStoreList(newContent);
      setMenuPageData({ page, totalPages });
      setIsLoading(false);
      setSearchText(menuName);
    } catch (err) {
      alert(`상품검색에러 ${err}`);
    }
  };

  const getMenuByPage = async ({ itemSize, page }) => {
    try {
      const res = await getMenuList({ itemSize, page });
      const { content, totalPages } = res.data;
      const newContent = changeImagePath(content);
      setStoreList(newContent);
      setMenuPageData({ page, totalPages });
      setIsLoading(false);
    } catch (err) {
      alert(`상품조회에러 ${err}`);
    }
  };

  const getRank = async () => {
    const { data: { ranking = [] } = [] } = await getRankApi();
    setRankData(ranking);
  };

  useEffect(() => {
    getMenuByPage({ itemSize: 12, page: 0 });
    getRank();
  }, []);

  return (
    <MainPresenter
      rankData={rankData}
      isLoading={isLoading}
      list={storeList}
      menuDetailData={menuDetailData}
      mapDetailData={mapDetailData}
      searchMenuListByName={searchMenuListByName}
      menuPageData={menuPageData}
      getMenuByPage={getMenuByPage}
      searchText={searchText}
    />
  );
};

export default MainContainer;
