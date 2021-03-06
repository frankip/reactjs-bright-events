import React, { Component } from 'react';
import axios from 'axios';
import toastr from 'toastr';
import jwtDecode from 'jwt-decode';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';

// foundation
import { Row, Column } from 'react-foundation-components/lib/global/grid';

// local imports
import Navigation from './Navigation';
import { instance, ROOT, isTokenExpired } from './url_config';

const styles = {
  formstyle: {
    margin: 2,
    padding: 4,
  },
};

class EventCardDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: localStorage.getItem('access_token'),
      open: false,
      isOpened: false,
      event: {},
      rsvpList: [],
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleOpenState = this.toggleOpenState.bind(this);
    this.toggleDeleteDialog = this.toggleDeleteDialog.bind(this);
    this.handleRsvp = this.handleRsvp.bind(this);
  }
  // toggle opening and closing dialog
  toggleOpenState() {
    this.setState({
      open: !this.state.open,
    });
  }

  // Openning and clossing the delete action dialog
  toggleDeleteDialog() {
    this.setState({ isOpened: !this.state.isOpened });
  }

  // fetch event details if there are no props
  getEventFromId() {
    const eventId = this.props.match.params.id;
    axios
      .get(`${ROOT}/events/${eventId.toString()}`)
      .then(response => {
        this.setState({ event: response.data });
      })
      .catch(function (error) {
      });
  }

  // onchange handler for date picker
  setDate(x, date) {
    const event = Object.assign({}, this.state.event);
    event.date = date.toDateString();
    this.setState({ event });
  }

  // fetch RSVP list
  retrieveRSVPList() {
    const eventId = this.props.match.params.id;

    instance
      .get(`${ROOT}/events/${eventId.toString()}/rsvp/`)
      .then(response => {
        this.setState({ rsvpList: response.data });
      })
      .catch(function (error) {
      });
  }

  componentWillMount() {
    if (this.props.location.state) {
      this.setState({ event: this.props.location.state.event });
    } else {
      this.getEventFromId();
    }
    this.retrieveRSVPList();
  }

  // Make rsvp reservation
  handleRsvp() {
    const eventId = this.props.match.params.id;

    instance
      .post(`${ROOT}/events/${eventId.toString()}/rsvp/`)
      .then(response => {
        toastr.success(response.data.message);
      })
      .catch(function (error) {
        toastr.warning(error.response.data.message);
      });
  }

  // Edit and post event
  handleEdit() {
    const eventId = this.props.match.params.id;
    const payload = this.state.event;

    this.toggleOpenState();

    instance
      .put(`${ROOT}/events/${eventId.toString()}/`, payload)
      .then(() => {
        toastr.success('Event updated succesfully');
      })
      .catch(function (error) {
        toastr.warning('Failed to update ');
      });
    this.props.history.replace(`/events/${eventId.toString()}`);
  }

  // delete event
  handleDelete() {
    const IDEvent = this.state.event.id;
    this.toggleDeleteDialog();
    instance
      .delete(`${ROOT}/events/${IDEvent.toString()}`)
      .then(response => {
        toastr.success(response.data.message);
        this.props.history.replace('/myevents');
      })
      .catch(function (error) {
        toastr.warning(error.response.data.message);
      });
  }

  // get data from input and update state
  handleChange(e) {
    const event = Object.assign({}, this.state.event);
    event[e.target.name] = e.target.value;
    this.setState({ event });
  }

  render() {
    // action buttons for material UI dialog
    const action = [
      <RaisedButton
        label="close"
        secondary
        style={{ float: 'left' }}
        onClick={this.toggleOpenState}
      />,
      <RaisedButton
        label="Submit"
        primary
        keyboardFocused
        onClick={this.handleEdit}
      />,
    ];
    const actionDelete = [
      <RaisedButton
        label="Cancel"
        primary
        style={{ float: 'left' }}
        onClick={this.toggleDeleteDialog}
      />,
      <RaisedButton
        label="Delete"
        primary={false}
        onClick={this.handleDelete}
      />,
    ];

    const rsvps = this.state.rsvpList.map((rsvp, idx) => (
      <div key={idx}>
        <h5>{rsvp.name}</h5> <span className="email-view">{rsvp.email}</span>
      </div>
    ));

    return (
      <div>
        <Navigation />
        <section className="row wide event-container">
          <div className="overlay" />
          <h2 className="text-display">
            {this.state.event.title || this.state.event.event}
          </h2>
          <h3 className="text-display">{this.state.event.date}</h3>
          <h4 className="text-display">{this.state.event.location}</h4>
        </section>
        <section className="row event-description">
          <div className="column large-8 small-12">
            <h3>Description</h3>
            {this.state.event.description ?
              <p>{this.state.event.description}</p>
            :
              <p> There is no description for this event </p>
            }
            {this.state.token && !isTokenExpired(this.state.token) ?
              <div>
                {this.state.event.created_by === jwtDecode(this.state.token).sub ?
                  <div className="row interactions">
                    <div className="left">
                      <li>
                        <button href="#" onClick={this.toggleOpenState}>
                          <i className="fa fa-pencil fa-3x" />{' '}
                        </button>
                      </li>
                      <li>
                        <button href="#" onClick={this.toggleDeleteDialog}>
                          <i className="fa fa-trash-o fa-3x" />
                        </button>
                      </li>
                    </div>
                  </div>
                : null}
              </div>
            : null}
          </div>
          {this.state.token && !isTokenExpired(this.state.token) ?
            <div className="column large-3 small-12">
              {this.state.event.created_by === jwtDecode(this.state.token).sub ?
                <div>
                  <h3> Guest list </h3>
                  {this.state.rsvpList.length === 0 ?
                    <p>There are no guests for your event</p>
                  :
                    <div>
                      {rsvps}
                    </div>
                  }
                </div>
                :
                <button className="button expanded" onClick={this.handleRsvp}>
                  RSVP
                </button>}
            </div>
            : null
            }
          <Dialog title="Update Event" actions={action} modal open={this.state.open} onRequestClose={this.toggleOpenState} autoScrollBodyContent>
            <Row>
              <form method="POST" onSubmit={this.handleSubmit}>
                <Row>
                  <Column large={6}>
                    <input type="text" name="event" placeholder="Event Name" required value={this.state.event.title || this.state.event.event} onChange={this.handleChange} />
                  </Column>
                  <Column large={6}>
                    <input type="text" name="category" placeholder="category" required value={this.state.event.category} onChange={this.handleChange} />
                  </Column>
                </Row>
                <Row>
                  <Column large={6}>
                    <input type="text" name="location" placeholder="Event Location" required value={this.state.event.location} onChange={this.handleChange} />
                  </Column>
                  <Column large={6}>
                    <DatePicker hintText="Event date" name="date" fullWidth inputStyle={styles.formstyle} defaultDate={new Date(this.state.event.date)} onChange={(x, date) => this.setDate(x, date)} />
                  </Column>
                </Row>
                <Row>
                  <Column small={12} medium={12} large={12}>
                    <textarea name="description" type="text" placeholder="Event description" value={this.state.event.description || ''} cols="30" rows="5" onChange={this.handleChange} />
                  </Column>
                </Row>
              </form>
            </Row>
          </Dialog>
          <Dialog
            actions={actionDelete}
            modal={false}
            open={this.state.isOpened}
            onRequestClose={this.toggleDeleteDialog}
          >
           Are you sure you want to delete this event?
          </Dialog>
        </section>
      </div>
    );
  }
}

export default EventCardDetails;
