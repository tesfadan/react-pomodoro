import React from 'react';
import ReactDom from 'react-dom';

import Title from 'react-title-component';
import Mousetrap from 'mousetrap';
import GithubCorner from 'react-github-corner';

import Footer from '../Footer/Footer';

export default class Pomodoro extends React.Component {

  constructor() {
    super();
    this.state = {
      time: 0,
      play: false,
      timeType: 0,
      volume: this._getLocalStorageVolume(),
      title: ''
    };
    // Bind early, avoid function creation on render loop
    this.setTimeForCode = this.setTime.bind(this, 1500);
    this.setTimeForSocial = this.setTime.bind(this, 300);
    this.setTimeForCoffee = this.setTime.bind(this, 900);
    this.reset = this.reset.bind(this);
    this.play = this.play.bind(this);
    this.elapseTime = this.elapseTime.bind(this);
  }

  componentDidMount() {
    this.setDefaultTime();
    this.startShortcuts();
    Notification.requestPermission();
  }

  elapseTime() {
    if (this.state.time === 0) {
      this.reset(0);
      this.alert();
    }
    if (this.state.play === true) {
      let newState = this.state.time - 1;
      this.setState({time: newState, title: this.getTitle(newState)});
    }
  }

  format(seconds) {
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 3600 % 60);
    let timeFormated = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    return timeFormated;
  }

  getFormatTypes() {
    return [
      {type: "code", time: 1500},
      {type: "social", time: 300},
      {type: "coffee", time: 900}
    ];
  }

  formatType(timeType) {
    let timeTypes = this.getFormatTypes();
    for(let i=0; i<timeTypes.length; i++) {
      let timeObj = timeTypes[i];
      if(timeObj.time === timeType) {
        return timeObj.type;
      }
    }
    return null;
  }

  restartInterval() {
    clearInterval(this.interval);
    this.interval = setInterval(this.elapseTime, 1000);
  }

  play() {
    if (true === this.state.play) return; 

    this.restartInterval();
    
    this.setState({ 
      play: true 
    });
  }

  reset(resetFor = this.state.time) {
    clearInterval(this.interval);
    let time = this.format(resetFor);
    this.setState({play: false});
  }

  togglePlay() {
    if (true === this.state.play)
      return this.reset();

    return this.play();
  }

  setTime(newTime) {
    this.restartInterval();
    
    this.setState({
      time: newTime, 
      timeType: newTime, 
      title: this.getTitle(newTime), 
      play: true
    });
  }

  setDefaultTime() {
    let defaultTime = 1500;

    this.setState({
      time: defaultTime, 
      timeType: defaultTime, 
      title: this.getTitle(defaultTime), 
      play: false
    });
  }

  getTitle(time) {
    time = typeof time === 'undefined' ? this.state.time : time;
    let _title = this.format(time) + ' | Pomodoro timer';
    return _title;
  }

  startShortcuts() {
    Mousetrap.bind('space', this.togglePlay.bind(this));
    Mousetrap.bind(['ctrl+left', 'meta+left'], this.toggleMode.bind(this,-1));
    Mousetrap.bind(['ctrl+right', 'meta+right'], this.toggleMode.bind(this,1));
  }

  handleVolume(e) {
    this.setState({...this.state,volume: Number(e.target.value)});
    this._setLocalStorageVolume(e.target.value)
  }

  toggleMode(gotoDirection) {
    let timeTypes = this.getFormatTypes();
    let currentPosition = -1;


    for (let i = 0; i < timeTypes.length; i++) {
      if (timeTypes[i].time === this.state.timeType) {
        currentPosition = i;
        break;
      };
    };

    if (currentPosition !== -1) {
      let newMode = timeTypes[currentPosition + gotoDirection];
      if (newMode) this.setTime(newMode.time);
    };
  }

  _setLocalStorage (item, element) {
    let value = element.target.checked;
    localStorage.setItem('react-pomodoro-' + item, value);
  }


  _setLocalStorageVolume (value) {
    localStorage.setItem('react-pomodoro-volume', value);
  }

  _getLocalStorage (item) {
    return (localStorage.getItem('react-pomodoro-' + item) == 'true') ? true : false;
  }

  _getLocalStorageVolume () {
    return (localStorage.getItem('react-pomodoro-volume') || 50);
  }

  alert() {
    // vibration
    if(this.refs.vibrate.checked) {
      window.navigator.vibrate(1000);
    }
    // audio
    if(this.refs.audio.checked) {
      let audio = new Audio('songs/alarm.mp3');
      audio.volume = this.state.volume / 100;
      audio.play();
      setTimeout(()=> audio.pause(), 1400);
    }
    // notification
    if(this.refs.notification.checked) {
      if (this.state.timeType === 1500) {
        let notification = new Notification("Relax :)", {
          icon: "img/coffee.png",
          lang: "en",
          body: "Go talk or drink a coffee."
        });
      } else {
        let notification = new Notification("The time is over!", {
          icon: "img/code.png",
          lang: "en",
          body: "Hey, back to code!"
        });
      }
    }
  }

  render() {

    return (
      <div className="pomodoro">
        <GithubCorner
          href="https://github.com/afonsopacifer/react-pomodoro"
          bannerColor="#2BA0A0"
          octoColor="#272727"
        />

        <Title render={this.state.title} />

        {/* Main section
        ------------------------------- */}
        <div className="main">

          <div className="container display timer">
            <span className="time">{this.format(this.state.time)}</span>
            <span className="timeType">The {this.formatType(this.state.timeType)} time!</span>
          </div>

          <div className="container display types">
            <button className="btn code" onClick={this.setTimeForCode}>Work</button>
            <button className="btn social" onClick={this.setTimeForSocial}>Break</button>
            {/* <button className="btn coffee" onClick={this.setTimeForCoffee}>Coffee</button> */}
          </div>

          <div className="container">
            <div className="controlsPlay">
              <button className="play btnIcon" onClick={this.play}></button>
              <button className="stop btnIcon" onClick={this.reset}></button>
            </div>
          </div>

        </div> {/* main */}

        {/* Bottom section
        ------------------------------- */}
        <div className="bottomBar">

          <div className="controls">
            <div className="container">

              <div className="controlsLink">
                <a href="https://en.wikipedia.org/wiki/Pomodoro_Technique" target="_blank">What is Pomodoro?</a>
              </div>

              <div className="controlsCheck">

                <span className="check">
                  <input 
                    type="checkbox" 
                    ref="notification" 
                    id="notification"
                    defaultChecked={this._getLocalStorage('notification')}
                    onChange={this._setLocalStorage.bind(this, 'notification')} 
                  />
                  <label htmlFor="notification"></label>
                  <span className="checkTitle" >Notification</span>
                </span>

                <span className="check">
                  <input 
                    type="checkbox" 
                    ref="audio" 
                    id="audio"
                    defaultChecked={this._getLocalStorage('audio')}
                    onChange={this._setLocalStorage.bind(this, 'audio')} 
                  />
                  <label htmlFor="audio"></label>
                  <span className="checkTitle">Sound</span>
                </span>

                <span className="check">
                  <input 
                    type="checkbox" 
                    ref="vibrate" 
                    id="vibrate"
                    defaultChecked={this._getLocalStorage('vibrate')}
                    onChange={this._setLocalStorage.bind(this, 'vibrate')} 
                  />
                  <label htmlFor="vibrate"></label>
                  <span className="checkTitle">Vibration</span>
                </span>

                <span className="volume">
                  <svg  x="0px" y="0px"
                    viewBox="0 0 448.046 448.046" >
                  <path d="M358.967,1.614c-5.6-2.72-12.128-1.952-16.928,1.92L186.391,128.046h-74.368c-17.664,0-32,14.336-32,32v128
                    c0,17.664,14.336,32,32,32h74.368l155.616,124.512c2.912,2.304,6.464,3.488,10.016,3.488c2.336,0,4.704-0.544,6.944-1.6
                    c5.536-2.656,9.056-8.256,9.056-14.4v-416C368.023,9.902,364.503,4.302,358.967,1.614z"/>
                  </svg >
                  <input 
                    type="range" 
                    id="volume"
                    type="range" 
                    min="0" max="100" 
                    value={this.state.volume} 
                    onChange={e => this.handleVolume(e)}
                    step="1"/>
          
                </span>

              </div> {/* controlsCheck */}

            </div> {/* container */}
          </div> {/* controls */}

          <Footer />

        </div> {/* bottomBar */}

      </div> /* bottomBar */
    );
  }
};
