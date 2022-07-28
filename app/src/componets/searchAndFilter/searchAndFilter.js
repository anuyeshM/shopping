import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './searchAndFilter.css';

import config from '../../commons/config';
import api from '../../commons/api';
import Filters from './filters';
import Util from '../../commons/util/util';

function SearchAndFilter(props) {
  const history = useHistory();
  const { storeData } = props;
  const { setStoreList } = props;
  const { setShowBannerTabs } = props;
  const { filterList } = props;
  const { setSelectedFiltersParent } = props;
  const { selectedFiltersParent } = props;
  const { setShowScreenFilters } = props;
  // console.log('filterList', filterList);
  const [isWebView] = useState(Util.isWebView());
  const [searchString, setSearchString] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOverride, setIsSearchOverride] = useState(false);
  const [triggerGetSearch, setTriggerGetSearch] = useState(false);

  const [searchResults, setSearchResults] = useState([]);

  //**contains function for searchResults API */
  useEffect(() => {
    const handler = setTimeout(() => {
      getSearchSuggestion();
    }, config.ux.throttleControl);

    return () => clearTimeout(handler);
  }, [triggerGetSearch]);

  function getSearchSuggestion() {
    const apiURL = config.api.searchSuggestionsStore;
    if (searchString && !isSearchOverride) {
      // console.log('api search results called', searchString);

      api
        .get(config.api.searchSuggestionsStore, { searchString })
        .then((data) => {
          if (data.data) {
            // console.log('results:', json.data.suggestions);
            setSearchResults(data.data.suggestions);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setSearchResults([]);
          setIsLoading(true);
        });
    } else {
      setIsSearchOverride(false);
      setSearchResults([]);
      setIsLoading(true);
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      setIsLoading(true);
      getStoreList();
      setShowBannerTabs(false);
    }
    if (searchString == '') {
      setShowBannerTabs(true);
      setStoreList(storeData);
    }
  }

  function handleListItemClick(e) {
    setSearchString(e.target.innerHTML.replace(/(<([^>]+)>)/gi, ''));
    setIsLoading(true);
    getRedirect(e.target.innerHTML.replace(/(<([^>]+)>)/gi, ''));
    // getStoreList();
    // setIsClicked(true);
  }

  function getRedirect(searchString) {
    let id = '';
    // const newSearchString = getCapital(searchString);

    storeData.forEach((i) => {
      if (
        i._source.storeDisplayName.toUpperCase() == searchString.toUpperCase()
      )
        id = i._id;
    });

    // console.log('getRedirect', searchString, id);
    history.push('/' + id);
  }

  function getStoreList() {
    // console.log('getStoreList', storeData, searchResults);
    // getSearchSuggestion();
    const newStoreList = [];
    storeData.forEach((i) => {
      searchResults.forEach((j) => {
        if (i._source.storeDisplayName == j) {
          newStoreList.push(i);
        }
      });
    });
    setStoreList(newStoreList);
  }

  function getBoldedText(suggestion, searchString) {
    if (
      suggestion.toLowerCase().indexOf(searchString.toLowerCase()) > -1 &&
      searchString.length > 0
    ) {
      const main = suggestion;
      const val =
        main.slice(0, main.toLowerCase().indexOf(searchString.toLowerCase())) +
        '<b>' +
        searchString +
        '</b>' +
        main.slice(
          main.toLowerCase().indexOf(searchString.toLowerCase()) +
            searchString.length,
          main.length
        );

      return (
        <div>
          <span dangerouslySetInnerHTML={{ __html: val }} />
        </div>
      );
    } else {
      return <span>{suggestion}</span>;
    }
  }

  return (
    <div
      className='search-input-container'
      style={isWebView ? null : { marginTop: '58pt' }}>
      <div className='search-filter-container'>
        <div className='search-icon-container'></div>
        <div className='search-input-field-container'>
          <input
            type='search'
            data-id='searchInput'
            className='no-select search-input'
            placeholder='Search Stores'
            value={searchString}
            onChange={(e) => {
              setSearchString(e.target.value);
              setTriggerGetSearch(!triggerGetSearch);
            }}
            onKeyDown={(e) => handleKeyPress(e)}
          />
        </div>
        {/* <div className="filterIcon-container"></div> */}
        <Filters
          key={Math.random()}
          filterList={filterList}
          setStoreList={setStoreList}
          setShowBannerTabs={setShowBannerTabs}
          storeData={storeData}
          setSelectedFiltersParent={setSelectedFiltersParent}
          selectedFiltersParent={selectedFiltersParent}
          setShowScreenFilters={setShowScreenFilters}
        />
        {(!isLoading && searchResults.length) > 0 ? (
          <div
            data-id='storeSearchSuggestions'
            className='store-search-suggestions-container'>
            {searchResults && (
              <ul className='searchResultList'>
                {searchResults.map((item, index) => (
                  <li
                    className='searchResultListItem'
                    key={`key_${index}`}
                    onClick={handleListItemClick}>
                    {getBoldedText(item, searchString)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default SearchAndFilter;
