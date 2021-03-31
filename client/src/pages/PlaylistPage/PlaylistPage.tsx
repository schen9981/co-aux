import React from 'react';
import { RouteComponentProps } from 'react-router';
import './PlaylistPage.css';

interface PlaylistRouteParams {id: string};

type PlaylistPageProps  = {
};

type PlaylistPageState = {
};

export default class PlaylistPage extends React.Component<PlaylistPageProps & RouteComponentProps<PlaylistRouteParams>, PlaylistPageState> {
  constructor(props: PlaylistPageProps & RouteComponentProps<PlaylistRouteParams>) {
      super(props);
  }

  render() {
    return (
      <div className="playlist">
        {this.props.match.params.id}
      </div>
    );
  }
}