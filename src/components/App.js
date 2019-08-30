import React from 'react'
import GithubStatistics from './GithubStatistics'
import '../css/App.css'
class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
        </header>
        <div>
          <GithubStatistics />
        </div>
      </div>
    )
  }
}



export default App
