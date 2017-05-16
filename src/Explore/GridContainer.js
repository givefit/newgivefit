import React from 'react'
import PropTypes from 'prop-types'

// import { Tab, Tabs } from 'material-ui'

import foursquare from 'utils/foursquareApi'

// import Groups from './Groups/ParkContainer'
import Activities from './Activities/'

// import ActivityContainer from './ActivityContainer'
import MapContainer from './Map/index'
import AddActivity from './AddActivity/index'

class GridComponent extends React.Component {
  constructor (props) {
    super(props)

    this.googleMaps = window.google.maps

    if (!this.googleMaps) {
      console.error('Google map api was not found in the page.')
      return
    }

    this.state = {
      indexedParks: {},
      loadedMapData: false,
      activeMarkerIndex: -1,
      openedParkID: '',
    }

    this.geocoder = new this.googleMaps.Geocoder()
  }

  componentDidMount () {
    this.fetchParks()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.workouts.length !== this.props.workouts.length) {
      this.fetchParks()
    }
  }

  /*
    Working on Google API for location fetching
    This google apis return the places in sets of 20, the maximum number of
    places that an api can fetch is 60. If you carefully observe the response of
    the google places api, it has a parameter called next_pagetoken.
    So the second time you hit the API u need to pass this next_pagetoken to
    fetch the next set of schools.@ChithriAjay
    how to do multiple types
    http://stackoverflow.com/questions/19625228/google-maps-api-multiple-keywords-in-place-searches
  */
  fetchParks () {
    const { centerLatLng, workouts } = this.props

    // Note : This concatination logic can be moved to foursquareApi.js to keep it consistent with googleApi
    // FourSquare category tree: https://developer.foursquare.com/categorytree
    const query = {
      ll: centerLatLng.lat.toString().concat(',' + centerLatLng.lng.toString()),
      radius: 5000,
      query: 'recreation center',
      venuePhotos: 1,
    }

    // Foursquare api calls
    // Explore: https://developer.foursquare.com/docs/venues/explore
    const recCentersPromise = foursquare.venues.explore(Object.assign({}, query, { query: 'recreation center' }))
    const parksPromise = foursquare.venues.explore(Object.assign({}, query, { query: 'park' }))

    Promise.all([recCentersPromise, parksPromise])
      .then(([recCentersResult, parksResult]) => {
        const recCenters = recCentersResult.response.groups[0].items
        const parksResults = parksResult.response.groups[0].items
        const parksAndRecs = parksResults.concat(recCenters)

        // Build parks by ID object
        const indexedParks = {}

        // @todo: move this traversal to the utils files
        parksAndRecs.map((park) => {
          var parkVenue = park.venue
          // need to iterate over workouts, matching them to the place_id, adding
          // them as an array to the indexedParks
          const filteredWorkouts = workouts.filter((workout) => parkVenue.id === workout.node.parkId)

          indexedParks[parkVenue.id] = {
            parkId: parkVenue.id,
            title: parkVenue.name,
            position: {
              lat: parkVenue.location.lat,
              lng: parkVenue.location.lng,
            },
            rating: parkVenue.rating,
            photos: this.foursquareGetUrl(parkVenue.photos),
            vicinity: parkVenue.location.address,
            workouts: filteredWorkouts,
          }
        })

        this.setState({
          indexedParks,
          loadedMapData: true,
        })
      })
      .catch((err) => console.log(err))
  }

  setActiveIndex (index, parkID = '') {
    if (parkID === this.state.openedParkID) {
      parkID = ''
    }

    if (index === this.state.activeMarkerIndex) {
      index = -1
    }

    this.setState({
      openedParkID: parkID,
      activeMarkerIndex: index,
    })
  }

  // Url generator for foursquare
  foursquareGetUrl (photos) {
    var image = photos.groups && photos.groups[0] && photos.groups[0].items[0]
    // the original can be edited as required to get the required image dimensions
    // Read https://developer.foursquare.com/docs/responses/photo
    return image ? image.prefix + 'original' + image.suffix : null
  }

  render () {
    const { centerLatLng, workouts, profile, onPlaceSelect } = this.props
    const { loadedMapData, activeMarkerIndex, indexedParks, openedParkID } = this.state

    return (
      <div className='__app__body__container'>
        <div className='__app__body__container__left'>
          {loadedMapData &&
            <MapContainer
              mapCenter={centerLatLng}
              workouts={workouts}
              indexedParks={indexedParks}
              activeMarker={activeMarkerIndex}
              geocoder={this.geocoder}
              onMarkerClick={(index, parkID) => this.setActiveIndex(index, parkID)}
              onPlaceSelect={onPlaceSelect}
            />
          }
          {/*this.state.openedParkID &&
            <ActivityContainer
              indexedParks={indexedParks}
              openedParkID={this.state.openedParkID}
              parkTitle={indexedParks[this.state.openedParkID].googleData.title}
              workouts={indexedParks[this.state.openedParkID].googleData.workouts}
              closeActivity={() => this.setActiveIndex()}
            />*/}
        </div>

        {loadedMapData &&
          <div className='__grid__list' >
            {/*<Tabs className='__tabs__container'>
              <Tab label='Activities'>*/}
                <AddActivity indexedParks={indexedParks} />
                <Activities
                  workouts={indexedParks[openedParkID] ? indexedParks[openedParkID].workouts : []}
                />
              {/*</Tab>*/}
              {/*<Tab label='Locations'>
                <AddActivity indexedParks={indexedParks} />
                <Groups
                  placeById={indexedParks}
                  profile={profile}
                  activeMarkerIndex={activeMarkerIndex}
                  onFeedItemClick={(index, parkID) => this.setActiveIndex(index, parkID)}
                />
              </Tab>
            </Tabs>*/}
          </div>
        }
      </div>
    )
  }
}

GridComponent.propTypes = {
  centerLatLng: PropTypes.object.isRequired,
  workouts: PropTypes.array.isRequired,
  workoutGroups: PropTypes.array.isRequired,
  //profile: PropTypes.object.isRequired,
  onPlaceSelect: PropTypes.func.isRequired,
}

export default GridComponent