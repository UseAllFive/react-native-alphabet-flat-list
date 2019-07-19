/**
 * Created by JetBrains WebStorm.
 * Author: yoon
 * Date: 19-4-12
 * Time: 下午3:03
 * Desc: 字母列表
 */
import React from 'react';
import PropTypes from 'prop-types';
import { PanResponder, View } from 'react-native';
import Toast from 'react-native-root-toast';

let toast = null;

export function AlphabetListView({ contentHeight, pageY, titles, onSelect, selectAlphabet, item }) {
  const itemHeight = contentHeight / titles.length;

  const onTouchChange = (evt, type) => {
    const event = evt.nativeEvent || {};
    const index = Math.floor((event.pageY - pageY) / itemHeight);

    // console.log('AlphabetListView.onTouchChange()', event.pageY, index, type);

    if (index >= 0) {
      if (toast) {
        setTimeout(() => {
          toast && Toast.hide(toast);
          toast = null;
        }, 100);
      }
      if (type === 'Move') {
        toast = Toast.show(`${titles[index]}`, {
          position: Toast.positions.CENTER,
          duration: 1000,
          shadow: false,
          opacity: 1,
          containerStyle: {
            height: 70,
            width: 70,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)'
          },
          textStyle: {
            color: 'white',
            fontSize: 35,
            fontWeight: 'bold'
          }
        });
      }
      onSelect && onSelect(index);
    }
  };

  const responder = PanResponder.create({
    // 要求成为响应者：
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => { },
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => { },
    onPanResponderTerminationRequest: () => true,
    onPanResponderGrant: evt => onTouchChange(evt, 'Grant'),
    // onPanResponderStart: evt => onTouchChange(evt, 'Start'),
    onPanResponderMove: evt => onTouchChange(evt, 'Move')
    // onPanResponderEnd: evt => onTouchChange(evt, 'End'),
    // onPanResponderRelease: evt => onTouchChange(evt, 'Release')
  });

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 10,
        zIndex: 10,
        height: contentHeight
      }}
      {...responder.panHandlers}>
      {titles.map((title, index) => item({ title, active: selectAlphabet === title }))}
    </View>
  );
}

AlphabetListView.propTypes = {
  prop: PropTypes.any
};
