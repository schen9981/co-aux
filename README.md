# Co-Aux
[![Deploy to Amazon ECS](https://github.com/schen9981/co-aux/actions/workflows/aws.yml/badge.svg)](https://github.com/schen9981/co-aux/actions/workflows/aws.yml)

Co-Aux is a web application app that allows its users to collaborate and interact with others to create and manage unique music playlists as they are streaming (tentatively via Spotify). Music is present at nearly every moment of day to day life, from getting ready in the morning to commuting to work to hosting a party with friends. Co-Aux would make it easier for users to better match their playlists to the moment by allowing other users to provide input into what is playing.

## API Reference
### User
#### Get a User's Profile
  - Endpoint: GET /api/user 
  - Response: Response body contains a user's profile information in JSON format

### Playlist
#### Get a User's Playlists
  - Endpoint: GET /api/playlist
  - Response: Response body contains a user's all playlists in JSON format

#### Get a Playlist's details
  - Endpoint: Get /api/playlist/{playlist_id}
  - Path Paramters: 
    - {playlist_id} - the id of a playlist
  - Response: Response body contains a playlist's details in JSON format

#### Create a New Playlist
  - Endpoint: POST /api/playlist
  - Body Paramaeters:
    - {name} - the name of a new playlist
    - {collaborative} - if true, the new playlist will be collaborative
    - {description} - the description of a new playlist
  - Response: Response body contains a newly created playlist's details in JSON format
  - Example Request:
  ```javascript
  fetch('/api/playlist/', 
  {
      method: 'POST', 
      headers: {'content-type':'application/json'}, 
      body: JSON.stringify({
          name: 'Sample Name',
          collaborative: 'true',
          description: 'Sample description'
  })
    .then(resp => resp.json())
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
  ```

#### Update a Playlist
  - Endpoint: PUT /api/playlist/{playlist_id}
  - Path Parameters:
    - {playlist_id} - the id of a playlist
  - Body Parameters:
    - {name} - the new name of a playlist
    - {collaboraitve} - the new collaborative status of a playlist
    - {description} - the new description of a playlist
  - Example Request:
  ```javascript
  fetch('/api/playlist/', 
  {
      method: 'PUT', 
      headers: {'content-type':'application/json'}, 
      body: JSON.stringify({
          name: 'New Name',
          collaborative: 'false',
          description: 'New description'
  })
    .then(resp => resp.json())
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
  ```


#### Get Tracks of a Playlist
  - Endpoint: GET /api/playlist/{playlist_id}/tracks
  - Path Parameters:
    - {playlist_id} - the id of a playlist

#### Insert Tracks Into a Playlist
  - Endpoint: POST /api/playlist/{playlist_id}/tracks
    - {playlist_id} - the id of a playlist
  - Body Parameters:
    - uris - an array of uris in JSON format
  - Response: Response body contains snapshot_id in JSON format
  - Example Request:
  ```javascript
  fetch('/api/playlist/6ZaFdsdci68plRoiWwUwj3/tracks', 
  {
      method: 'POST', 
      headers: {'content-type':'application/json'}, 
      body: JSON.stringify({
          uris: [
              'spotify:track:3BQHpFgAp4l80e1XslIjNI', 'spotify:track:1oZX407PWkU5ETtmRy3zL8'
            ]})
  })
    .then(resp => resp.json())
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
  ```


#### Remove Tracks From a Playlist
  - Endpoint: DELETE /api/playlist/{playlist_id}/tracks
  - Body Parameters:
    - tracks - an array of track objects in JSON format
  - Response: Response body contains snapshot_id in JSON format
  - Example Request:
  ```javascript
  fetch('/api/playlist/6ZaFdsdci68plRoiWwUwj3/tracks', 
  {
      method: 'DELETE', 
      headers: {'content-type':'application/json'}, 
      body: JSON.stringify({
          tracks: [
              {'uri':'spotify:track:3BQHpFgAp4l80e1XslIjNI'}, {'uri':'spotify:track:1oZX407PWkU5ETtmRy3zL8'}
            ]})
  })
    .then(resp => resp.json())
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
  ```

### Search
#### Search Tracks with Name
  - Endpoint: GET /api/search
  - Query Parameters:
    - {name} - a name used to search tracks
  - Response: Response body 