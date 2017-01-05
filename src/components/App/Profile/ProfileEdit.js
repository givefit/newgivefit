import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'
import AuthService from 'utils/AuthService'
import TextField from 'material-ui/TextField'
import s from './styles.module.css'

export class ProfileEdit extends React.Component {
  handleSubmit(e){
    e.preventDefault()
    const { profile, auth } = this.props
    auth.updateProfile(profile.user_id, {
      user_metadata: {
        address: ReactDOM.findDOMNode(this.refs.address).value
      }
    })
  }

  render(){
    const { profile } = this.props
    const { address } = profile.user_metadata || {}
    return (
      <div className={s.root}>
          <h3>About Me</h3>
            <br />
            <TextField
              hintText="The hint text can be as long as you want, it will wrap."
            /><br />
            
          {/*<Form horizontal onSubmit={this.handleSubmit.bind(this)}>
            <FormGroup controlId="address">
              <Col componentClass={ControlLabel} sm={2}>
                Address
              </Col>
              <Col sm={10}>
                <FormControl type="text" defaultValue={address} ref="address" />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={2} sm={10}>
                <Button type="submit">Save</Button>
              </Col>
            </FormGroup>
          </Form>*/}
        
      </div>
    )
  }
}

ProfileEdit.propTypes = {
    profile: T.object,
    auth: T.instanceOf(AuthService)
  }

export default ProfileEdit;