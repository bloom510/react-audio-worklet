import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Menu, Dropdown, Icon, Button } from 'antd';
import { Bypasser, onePoleFilter, noiseGenerator, bitCrusher } from './Demos'

class App extends Component {
  constructor() {
    super();
    this.state = {
      selected: null, /* Which menu item has been selected? (String) */
      isPlaying: false, /* Is audio currently playing? (Boolean) */
      processor: null, /* Current AudioWorkletProcessor (String) */
      node: null, /* Current AudioWorkletNode (AudioWorkletNode)*/
      moduleLoaded: false, /* Has the selected AudioWorkletProcessor finished loading? (Boolean)*/
    }
  }
  /* The function below takes module name as an arg and adds it to the AudioContext's audioWorklet */
  async loadModule(moduleName) {
    const { actx } = this;   
    try {
      await actx.audioWorklet.addModule(
        `worklet/${moduleName}.js`,
      );
      this.setState({moduleLoaded: true})
      console.log(`loaded module ${moduleName}`);
    } catch(e) {
      this.setState({moduleLoaded: false})
      console.log(`Failed to load module ${moduleName}`);
    }
  }
  /* The function below loads modules when selected from the dropdown menu. */
  handleSelect(name, processor) {
    if(this.state.isPlaying) return;
    this.setState({selected: name, processor, moduleLoaded: false}, () => {
      if(!this.actx) {
        try {
          console.log('New context instantiated')
          this.actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.log(`Sorry, but your browser doesn't support the Web Audio API!`, e);
        }
      } 
      this.loadModule(processor)
    });
  }
  /* The function below handles the starting and stopping of the currently loaded module.  */
  handleClick() {
    const { state } = this;
    if(state.selected) {
      this.setState({isPlaying: !state.isPlaying});    
    }  
    const toggleNode = (node, isPlaying, cb) => {
      if(isPlaying) {
        console.log(`stopping ${state.selected}`)
        node.port.postMessage(false)
      } else {
        console.log(`playing ${state.selected}`)
        node = cb(this);
        this.setState({ node });
        node.port.postMessage(true);          
      }
    }  
    switch(state.selected) {
      case 'Bypass Filter':
        toggleNode(state.node, state.isPlaying, Bypasser)
      break;
      case 'One Pole Filter':
        toggleNode(state.node, state.isPlaying, onePoleFilter)        
      break;
      case 'Noise':
        toggleNode(state.node, state.isPlaying, noiseGenerator)        
      break;
      case 'Bitcrusher':
        toggleNode(state.node, state.isPlaying, bitCrusher)        
      break;
    }
  }
  render() {
    const { state } = this;
    /* Menu is an overlay for the Ant Design dropdown component, passed in via props. */
    const menu = (
      <Menu onClick={(e) => this.handleSelect(e.key, e.item.props.processor)} selectedKeys={[this.state.current]}>
        <Menu.Item key="Bypass Filter" processor='bypass-processor'>
          Bypass Filter
        </Menu.Item>
        <Menu.Item key="One Pole Filter" processor='one-pole-processor'>
          One Pole Filter
        </Menu.Item>
        <Menu.Item key="Noise" processor='noise-generator'>
          Noise
        </Menu.Item>
        <Menu.Item key="Bitcrusher" processor='bit-crusher-processor'>
          Bitcrusher
        </Menu.Item>   
      </Menu>
    );
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <span>React + AudioWorklet = ❤</span>
          <div style={{float:'left', width: '100%'}}>
            <Dropdown overlay={menu} size='small'>
              <a className="ant-dropdown-link" href="#">
                {state.selected ? state.selected : 'Select a module'} <Icon type="down" />
              </a>
            </Dropdown>
            <Button ghost onClick={() => this.handleClick()} style={{marginLeft:'1%'}}>{state.isPlaying ? 'Stop' : 'Start'}</Button>
          </div>
        </header>
      </div>
    );
  }
}

export default App;