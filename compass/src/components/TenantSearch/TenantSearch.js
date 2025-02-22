import React from 'react';
import LuigiClient from '@luigi-project/client';
import InfiniteScroll from 'react-infinite-scroll-component';

import fetchTenants from './fetchTenants';
import { ListGroup, Panel } from 'fundamental-react';
import { useMicrofrontendContext, useConfig } from 'react-shared';
import { Spinner } from '@kyma-project/components';
import { getAlternativePath } from '../../config/luigi-config/helpers/getAlternativePath';
import './TenantSearch.scss';

const DELAY_BETWEEN_SEARCH_MILLIS = 300;

const SearchInput = ({ setFilter }) => (
  <input
    className="search-field"
    autoFocus
    role="search"
    placeholder="Search tenants..."
    onChange={(e) => setFilter(e.target.value)}
    type="text"
  />
);

const TenantList = ({
  tenants,
  pageSize,
  fetcher,
  searchTerm,
  chooseTenant,
}) => (
  <div id="scrollable" className="scrollable-field">
    <InfiniteScroll
      dataLength={tenants.data.length}
      next={() => fetcher(searchTerm, pageSize, tenants.pageInfo.endCursor)}
      hasMore={tenants.pageInfo ? tenants.pageInfo.hasNextPage : null}
      loader={<Spinner key={searchTerm} />}
      scrollableTarget="scrollable"
    >
      <ListGroup className="fd-has-margin-top-s list-group">
        {tenants.data.map((tenant) => (
          <ListGroup.Item
            role="row"
            key={tenant.id}
            onClick={() => chooseTenant(tenant)}
            className="list-item"
          >
            <span className="link">{tenant.name}</span>
            <span className="fd-has-color-text-3">{tenant.id}</span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </InfiniteScroll>
  </div>
);

export function TenantSearch({ parentPath, token }) {
  const tenantInitialState = { data: [], pageInfo: {} };
  const [filter, setFilter] = React.useState('');
  const [tenants, setTenants] = React.useState({ ...tenantInitialState });
  const [error, setError] = React.useState('');
  const [didMount, setDidMount] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  let timeOutId;
  const setFilterWithDelay = (value) => {
    if (timeOutId) {
      clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
      setTenants(tenantInitialState);
      setFilter(value);
    }, DELAY_BETWEEN_SEARCH_MILLIS);
  };

  const { fromConfig } = useConfig();
  const compassUrl = fromConfig('compassApiUrl');

  const getTenants = (searchTerm, page, endCursor) => {
    fetchTenants(token, compassUrl, searchTerm, page, endCursor)
      .then((t) => {
        setTenants({
          ...t,
          data: [...tenants.data, ...t.data],
        });
        setPageSize(t.data.length);
      })
      .catch((e) =>
        setError(`Error: tenants could not be loaded: ${e.message}`),
      )
      .finally(() => setIsLoading(false));
  };

  // used to determine when was the first component render
  React.useEffect(() => {
    setDidMount(true);
  }, []);

  React.useEffect(() => {
    if (didMount) {
      const searchPhrase = filter.toLowerCase().trim();
      const cursor = tenants.pageInfo.endCursor;
      setIsLoading(true);
      getTenants(searchPhrase, pageSize, cursor);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const chooseTenant = (tenant) => {
    const path = getAlternativePath(tenant.id, parentPath);
    LuigiClient.linkManager().navigate(`/tenant/${path || tenant.id}`);
  };

  return (
    <Panel className="fd-has-padding-s tenant-search">
      <SearchInput setFilter={setFilterWithDelay} />
      {error && <p className="fd-has-color-status-3">{error}</p>}
      {isLoading && (
        <div className="tenant-search-spinner">
          <Spinner />
        </div>
      )}
      <TenantList
        fetcher={getTenants}
        pageSize={pageSize}
        searchTerm={filter}
        tenants={tenants}
        chooseTenant={chooseTenant}
      />
    </Panel>
  );
}

export default function TenantSearchWrapper() {
  const { idToken } = useMicrofrontendContext();
  return <TenantSearch token={idToken} parentPath={document.referrer} />;
}
