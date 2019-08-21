/**
 * Created by JetBrains WebStorm.
 * Author: yoon
 * Date: 19-4-12
 * Time: 下午2:15
 * Desc: 自定义带字母的滚动列表
 */
import React, { Component } from 'react';
import { View, InteractionManager, Dimensions, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { SectionHeader } from './SectionHeader';
import { AlphabetListView } from './AlphabetListView';
import { SectionListItem } from './SectionListItem';

const screenHeight = Dimensions.get('window').height;

export class SWAlphabetFlatList extends Component {
  static propTypes = {
    /**
     * 需要按字母展示的数据
     * 数据格式为: {
     *   A: [{
     *     id: 1,
     *     name: '1'
     *   }],
     *   B: [{
     *     id: 2,
     *     name: '2'
     *   }, {
     *     id: 3,
     *     name: '3'
     *   }],
     * }
     */
    data: PropTypes.object.isRequired,
    itemHeight: PropTypes.number.isRequired,
    renderItem: PropTypes.func.isRequired,
    sectionHeaderHeight: PropTypes.number,
    sectionItemComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    sectionHeaderComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    onSelect: PropTypes.func
  };

  static defaultProps = {
    sectionHeaderHeight: SectionHeader.height,
    sectionItemComponent: SectionListItem,
    sectionHeaderComponent: SectionHeader
  };

  constructor(props) {
    super(props);
    /**
     * 用于解决点击字母后又触发 onViewableItemsChanged 导致选中的字母与点击的字母不一致问题
     * @type {boolean}
     */
    this.touchedTime = 0;
    this.state = {
      containerHeight: screenHeight,
      itemLayout: [],
      titles: [],
      selectAlphabet: null,
      initialNumToRender: 0,
      pageY: 0 // 相对于屏幕的Y坐标
    };
  }

  componentDidMount() {
    this.refreshBaseData(this.props.data);
  }

  componentWillReceiveProps({ data }) {
    if (data !== this.props.data) {
      this.refreshBaseData(data);
    }
  }

  /**
   * 计算所需要的数据
   * @param data
   */
  refreshBaseData = data => {
    const titles = Object.keys(data);

    const offset = (index, itemLength) => index * this.props.sectionHeaderHeight + itemLength * this.props.itemHeight;

    const itemLayout = titles.map((title, index) => {
      const beforeItemLength = titles.slice(0, index).reduce((length, item) => length + data[item].length, 0);
      const itemLength = data[title].length;
      return {
        title,
        itemLength,
        beforeItemLength,
        length: this.props.sectionHeaderHeight + this.props.itemHeight * itemLength,
        offset: offset(index, beforeItemLength)
      };
    });

    // 计算首屏渲染的数量 避免出现空白区域
    let initialNumToRender = itemLayout.findIndex(item => item.offset >= this.state.containerHeight);
    if (initialNumToRender < 0) {
      initialNumToRender = titles.length;
    }

    this.setState({
      itemLayout,
      titles,
      selectAlphabet: titles[0],
      initialNumToRender
    });
  };

  /**
   * 获取列表区域高度，用于计算字母列表的显示
   */
  onLayout = ({ nativeEvent: { layout } }) => {
    // 保证导航动画完成之后在进行获取位置坐标 否则会不准确
    InteractionManager.runAfterInteractions(() => {
      this.alphabet.measure((x, y, w, h, px, py) => {
        this.setState({
          pageY: py
        });
      });
    });
    this.setState({
      containerHeight: layout && layout.height
    });
  };

  /**
   * 点击字母触发滚动
   */
  onSelect = index => {
    if (this.state.titles[index]) {
      const { length, offset } = this.getItemLayout(index);
      this.list.scrollTo({ x: 0, y: offset, animated: false });
      this.touchedTime = new Date().getTime();

      // Only emit when different index has been selected
      if (this.oldIndex !== index) {
        this.oldIndex = index;
        this.props.onSelect ? this.props.onSelect(index) : null;

        this.setState({
          selectAlphabet: this.state.titles[index]
        });
      }
    }
  };

  /**
   * 可视范围内元素变化时改变所选字母
   * @param viewableItems
   */
  onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems && viewableItems.length) {
      // 点击字母触发的滚动3秒内不响应
      if (new Date().getTime() - this.touchedTime < 3000) {
        return;
      }

      this.setState({
        selectAlphabet: viewableItems[0].item
      });
    }
  };

  getItemLayout = index => ({
    length: this.state.itemLayout[index].length,
    offset: this.state.itemLayout[index].offset,
    index
  });

  renderItem = item => {
    const MSectionHeader = this.props.sectionHeaderComponent;

    return (
      <View key={item}>
        <MSectionHeader title={item} />
        {this.props.data[item].map((itemValue, itemIndex, items) =>
          this.props.renderItem({
            item: itemValue,
            index: itemIndex,
            sectionId: item,
            last: itemIndex === items.length - 1
          })
        )}
      </View>
    );
  };

  render() {
    return (
      <View
        style={{
          justifyContent: 'center',
          flex: 1
        }}
        ref={ref => {
          this.container = ref;
        }}>
        <ScrollView
          ref={ref => {
            this.list = ref;
          }}
          {...this.props}>
          {this.props.renderHeader ? this.props.renderHeader() : null}
          {this.state.titles.map(item => this.renderItem(item))}
        </ScrollView>
        <AlphabetListView
          container={ref => (this.alphabet = ref)}
          pageY={this.state.pageY}
          onLayout={this.onLayout}
          contentHeight={this.state.containerHeight}
          item={this.props.sectionItemComponent}
          titles={this.state.titles}
          selectAlphabet={this.state.selectAlphabet}
          onSelect={this.onSelect}
        />
      </View>
    );
  }
}
