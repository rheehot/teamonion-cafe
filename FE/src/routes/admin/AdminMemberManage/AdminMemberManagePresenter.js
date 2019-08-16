import React, { useCallback } from 'react';
import propTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid';
import './styles/AdminMemberManagePresenter.scss';
import Pagination from '../../../components/pagination';
import SearchBar from '../../../components/SearchBar';

const AdminMemberManagePresenter = ({
  memberListData,
  memberListPageData,
  setPoint,
  getUserByPage,
  searchUserByID,
  searchText,
}) => {
  const colums = [
    {
      key: 'id',
      name: 'id',
      width: 40,
    },
    {
      key: 'memberId',
      name: '사용자ID',
      width: 100,
      resizable: true,
    },
    {
      key: 'memberRole',
      name: '권한',
      width: 100,
    },
    {
      key: 'point',
      name: '포인트',
      editable: true,
      resizable: true,
    },
  ];

  const rows = memberListData.map(item => ({
    id: item.id,
    memberId: item.memberId,
    memberRole: item.memberRole,
    point: item.point,
  }));

  const onGridRowsUpdated = ({ toRow, updated }) => {
    const data = Object.assign({}, { id: rows[toRow].id, changePoint: updated.point });
    const isPointChange = window.confirm(
      `${rows[toRow].memberId}님의 포인트를 ${data.changePoint}로 변경하시겠습니까?`,
    );
    isPointChange && setPoint(data);
  };

  const pageCallback = useCallback(
    e => {
      return searchText
        ? searchUserByID(searchText, e.target.value - 1)
        : getUserByPage({ itemSize: 10, page: e.target.value - 1 });
    },
    [searchText, searchUserByID, getUserByPage],
  );

  return (
    <div className="AdminMemberManagePresenter">
      <div className="memberManageListTitle">
        <div className="pageTitle">사용자관리</div>
        <SearchBar searchCallback={searchUserByID} />
      </div>
      <div className="memberManageList">
        <ReactDataGrid
          className="memberGrid"
          columns={colums}
          rowGetter={i => rows[i]}
          rowsCount={rows.length}
          onGridRowsUpdated={onGridRowsUpdated}
          enableCellSelect
        />
        <Pagination pageData={memberListPageData} maxIndex={8} callback={e => pageCallback(e)} />
      </div>
    </div>
  );
};

AdminMemberManagePresenter.defaultProps = {
  memberListData: [],
  memberListPageData: {},
  setPoint: () => {},
  getUserByPage: () => {},
  searchUserByID: () => {},
  searchText: '',
};

AdminMemberManagePresenter.propTypes = {
  memberListData: propTypes.arrayOf(propTypes.object),
  memberListPageData: propTypes.shape({
    page: propTypes.number,
    totalPages: propTypes.number,
  }),
  setPoint: propTypes.func,
  getUserByPage: propTypes.func,
  searchUserByID: propTypes.func,
  searchText: propTypes.string,
};

export default AdminMemberManagePresenter;
