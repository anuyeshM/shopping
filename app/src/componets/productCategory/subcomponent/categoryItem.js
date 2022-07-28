import React from 'react';
import { NavLink } from 'react-router-dom';

import TileComponent from './tileComponent';
//import TileComponent from '../../products/productTemplate';

const ProductClassification = (props) => {
  return (
    <div data-id={props.categoryId} className="product-category">
      <div className="category-header">
        <div className="category-title">{props.categoryName}</div>
        <NavLink
          to={{
            pathname: `/${props.storecode}/products`,
            storecode: props.storecode,
            categoryId: props.categoryId,
            categoryName: props.categoryName,
          }}
        >
          <div
            data-ref={props.categoryId}
            className="view-all"
            onClick={() => {
              window.selectedCategory = props.categoryName;
              window.selectedSubCategory = '';
            }}
          >
            View All
          </div>
        </NavLink>
      </div>
      <div className="category-content">
        <div className="horz-scroll-category">
          {props.items.map((item, index) => (
            <NavLink
              to={{
                pathname: `/${props.storecode}/products/detail/${item._id}`,
                storecode: props.storecode,
                id: item._id,
              }}
              key={`pTile_${index}`}
            >
              <TileComponent storecode={props.storecode} {...item} />
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductClassification;
