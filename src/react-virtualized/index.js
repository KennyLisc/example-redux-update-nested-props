import React from 'react';
import ReactDOM from 'react-dom';
import {Grid, AutoSizer}  from 'react-virtualized';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import set from 'lodash/fp/set';
import pipe from 'lodash/fp/pipe';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import 'react-virtualized/styles.css';

const UPDATE_TAG = 'UPDATE_TAG';

const reposById = pipe(
  groupBy('id'),
  mapValues(repos => repos[0])
)(require('json!../repos.json'));

const repoIds = Object.keys(reposById);

const store = createStore((state = {repoIds, reposById}, action) => {
  switch (action.type) {
  case UPDATE_TAG:
    return set('reposById.1.tags[0]', {id: 213, text: 'Node.js'}, state);
  default:
    return state;
  }
});

class Repo extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.repo !== nextProps.repo;
  }

  render() {
    const {repo} = this.props;
    const [authorName, repoName] = repo.full_name.split('/');
    return (
      <div className="repo-item">
        <div className="repo-full-name">
          <span className="repo-name">{repoName}</span>
          <span className="repo-author-name"> / {authorName}</span>
        </div>
        <ol className="repo-tags">
          {repo.tags.map((tag) => <li className="repo-tag-item" key={tag.id}>{tag.text}</li>)}
        </ol>
        <div className="repo-desc">{repo.description}</div>
      </div>
    );
  }
}

const ConnectedRepo = connect(
  (initialState, initialOwnProps) => {
    return (state) => ({repo: state.reposById[initialOwnProps.repoId]})
  },
  null,
  null,
  {pure: true}
)(Repo);

const RepoList = ({repoIds}) => {
  return (
    <div className="repos">
      <AutoSizer>
        {({height, width}) => {
          const columnCount = Math.floor(width / 290);
          const rowCount = Math.ceil(repoIds.length / columnCount);

          const cellRenderer = ({columnIndex, rowIndex}) => {
            const index = rowIndex * columnCount + columnIndex;
            if (index >= repoIds.length) {
              return null;
            }
            const repoId = repoIds[index];
            return <ConnectedRepo repoId={repoId} key={repoId}/>;
          };

          return (
            <Grid
              cellRenderer={cellRenderer}
              columnWidth={290}
              columnCount={columnCount}
              rowHeight={200}
              rowCount={rowCount}
              width={width}
              height={height}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

const App = connect(
  (state) => ({repoIds: state.repoIds}),
  null,
  null,
  {pure: true}
)(RepoList);

console.time('INITIAL');
ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('app')
);
console.timeEnd('INITIAL'); // about 550ms

setTimeout(() => {
  console.time('DISPATCH');
  store.dispatch({
    type: UPDATE_TAG
  });
  console.timeEnd('DISPATCH'); // about 40ms
}, 1000);
