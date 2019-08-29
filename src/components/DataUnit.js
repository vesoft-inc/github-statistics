import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { Card, Progress, Button, Row, Col, Icon } from 'antd'

class DataUnit extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      progress: 0,
      ready: false,
    }

  }

  _renderSection = (title, iconType = 'question', iconColor = 'black', action) => (
    <Row type="flex" align="middle">
      <Col span={8}>
        <Card bordered={false}>
          <Icon type={iconType} style={{ fontSize: '32px', color: iconColor }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false}>
          <div className="Section-title">
            {title}
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card bordered={false}>
          {action}
        </Card>
      </Col>
    </Row>
  )

  _renderGetButton = action => {
    const { loading, progress } = this.state

    const updateProgress = progress => this.setState({ progress })
    const wrappedOnUpdate = param => {
      action.onUpdate(param)
    }
    const wrappedFinish = param => {
      this.setState({ loading: false, ready: true })
      action.onFinish(param)
    }
    const scriptCall = _.partial(action.type, wrappedOnUpdate, wrappedFinish, updateProgress)
    const wrappedOnClick = () => {
      this.setState({ loading: true, progress: 0 })
      scriptCall()
    }
    return (
      <div style={{ display: 'inline-block'}}>
        <Button loading={loading} onClick={wrappedOnClick} icon="cloud-download">
          Update Data
        </Button>
        <Progress style={{ lineHeight: 0.7, display: 'block'}} percent={progress} showInfo={false} strokeWidth={5} />
      </div>
    )
  }

  render() {
    const { ready } = this.state
    const {
      title,
      iconType,
      iconColor,
      children,
      action,
    } = this.props
    return (
      <div>
        {this._renderSection(
          title, iconType, iconColor,
          this._renderGetButton(action)
        )}
        {ready && children}
      </div>
    )
  }
}

DataUnit.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string,
  iconColor: PropTypes.string,
  iconType: PropTypes.string,
  action: PropTypes.object,
}

export default DataUnit