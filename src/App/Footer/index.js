import React from 'react'
import PropTypes from 'prop-types'

import MobileBottomNav from './MobileBottomNav'

class Footer extends React.Component {
  render () {
    return (
      <div id='footer' className='__app__footer'>
        {['/', '/new-york', '/explore'].includes(this.props.pathname) &&
        <MobileBottomNav footerActiveTab={this.props.footerActiveTab} onTabChange={this.props.onTabChange} />}
      </div>
    )
  }
}

Footer.propTypes = {
  pathname: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  footerActiveTab: PropTypes.string.isRequired,
}

export default Footer
