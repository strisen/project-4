// ############### React ###############
import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  // Input,
  // Label,
  // Form,
  // FormGroup
} from 'reactstrap';

// ############### Components ###############
import Locations from './Locations'
import Dates from './Dates'
import Itinerary from './Itinerary'
import PlacesWithStandaloneSearchBox from './SearchBox';

// ############### Styling ###############
import '../styles/App.css'
// import logo from '../icon.png'


class App extends Component {

  // ========== Constructors ==========
  constructor() {
    super();
    this.state = {
      locationList: [],
      numberOfDays: [1],
      activeTab: 1,
      itineraryList: [],
      currentDayItinerary: [],
      tripID: ''
    };
  }

  // Test Code
  // ========== adding location to list ==========
  addToList = async ({ place_id, formatted_address, name, geometry: { location } }) => {
    console.log(this.state.tripID)
    // display on React client
    // var node = document.createElement("LI");
    // var textnode = document.createTextNode(`${name}, ${formatted_address} at ${location.lat()}, ${location.lng()}`);
    // node.appendChild(textnode);
    // document.getElementById("locationList").appendChild(node);

    // write to Express server
    var params = {
      id: place_id,
      name: name,
      address: formatted_address,
      latitude: location.lat(),
      longitude: location.lng(),
      tripID: this.state.tripID
    }
    const response = await fetch('/location/new', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    const body = await response.json()
    this.setState({ locationList: body })
  }

  // ========== fetching from db the itineray list ==========
  getItineraryList = async () => {
    const response = await fetch('/event/view');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    this.setState({ itineraryList: body });

    this.setState({
      currentDayItinerary: this.state.itineraryList.filter(event => event.date === this.state.activeTab)
    })
  }

  // ========== fetching from db the location list ==========
  retrieveFromList = async () => {
    const response = await fetch('/location/getAllForTrip');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    this.setState({ locationList: body });
  };

  // ========== deleting location from list ==========
  deleteFromList = async (id) => {
    const response = await fetch(`/location/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    const body = await response.json()
    this.setState({ locationList: body })
  }

  // ========== mounting of component ==========
  componentDidMount() {
    this.retrieveFromList()
    this.getItineraryList()
    let urlLength = window.location.href.split('/').length
    this.getTripId(window.location.href.split('/')[urlLength - 1])
  }

// ========== setting state for activeTab and currentDayItinerary ==========
  getActiveTab = async (data) => {
    await this.setState({activeTab: data})

    await this.setState({
      currentDayItinerary: this.state.itineraryList.filter(event => event.date === this.state.activeTab)
    })
  }

  // Event creation Test

  addToEvent = async (req) => {

    // write to Express server
    var params = {
      locationName: req.locationName,
      locationAddress: req.locationAddress,
      time: "00:00",
      date: this.state.activeTab
    };
    let response = await fetch('/event/new', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    this.getItineraryList()
  };

  // End of Event Creation Test

  // Update Event Test
  // ========== updating of event ==========
  updateEvent = async (req) => {

    // write to Express server
    var params = {
      // eventID: e.target.parentNode.id,
      description: req.description,
      // Mock data to represent event ID
      id: req.id,
      time: req.time
      // locationID: '5a8b8f5ec4e9267e17d6a63c'
      // trip_id: req.params.id,
      // name: this.state.locationList[e.target]
    };
    let response = await fetch(`/event/update/${params.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    this.getItineraryList()
  };
  // End of Update Event Test

  // Delete Event Test
  // ========== deleting event from the db ==========
  deleteEvent = async (req) => {

    // write to Express server
    var params = {
      // Mock data to represent event ID
      id: req
    };
    let response = await fetch(`/event/delete/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    this.getItineraryList()
  };

  // End of Test Code

  // get the number of days from dates

  getNumberOfDays = (props) => {
    let days = Array(props).fill().map((_,i) => i + 1)
    this.setState({numberOfDays: days})
  }

  // get tripID
  getTripId = async (id) => {
    const response = await fetch(`/trip/${id}`)
    const body = await response.json()
    this.setState({ tripID: body })
    console.log(body)
  }

  render() {
    return (
      <div className="main">
        <Container>
          <Row className="header">
            <Col className="col-8">
              <span>
                {/* <img src={logo} className="logo"/> */}
                <span className="title">TripCollab</span>
              </span>
            </Col>
            {/* <Col className="col-4">hello</Col> */}
          </Row>
          <Row>
            <Col className="col-7">
              <PlacesWithStandaloneSearchBox onAdd={this.addToList}/>
            </Col>
            <Col className="col-5">
              <Locations
                locations={this.state.locationList}
                onAdd={this.addToEvent}
                onDelete={this.deleteFromList}/>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col>
              <Dates getNumberOfDays={this.getNumberOfDays}/>
            </Col>
          </Row>
          <Row>
            <Col>
              <Itinerary numberOfDays={this.state.numberOfDays} getActiveTab={this.getActiveTab} activeTab={this.state.activeTab} itineraryList={this.state.currentDayItinerary}
              updateMethod={this.updateEvent}
              deleteMethod={this.deleteEvent}
               />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
