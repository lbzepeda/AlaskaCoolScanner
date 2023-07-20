import { createElement, PureComponent, useState } from 'react';

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

var ReactPanZoom = /*#__PURE__*/function (_React$PureComponent) {
  _inheritsLoose(ReactPanZoom, _React$PureComponent);

  function ReactPanZoom() {
    var _this;

    _this = _React$PureComponent.apply(this, arguments) || this;

    _this.getInitialState = function () {
      var _this$props = _this.props,
          pandx = _this$props.pandx,
          pandy = _this$props.pandy,
          zoom = _this$props.zoom;
      var defaultDragData = {
        dx: pandx,
        dy: pandy,
        x: 0,
        y: 0
      };
      return {
        comesFromDragging: false,
        dragData: defaultDragData,
        dragging: false,
        matrixData: [zoom, 0, 0, zoom, pandx, pandy],
        mouseDown: false
      };
    };

    _this.state = _this.getInitialState();

    _this.reset = function () {
      var matrixData = [0.4, 0, 0, 0.4, 0, 0];

      _this.setState({
        matrixData: matrixData
      });

      if (_this.props.onReset) {
        _this.props.onReset(0, 0, 1);
      }
    }; // tslint:disable-next-line: member-ordering


    _this.onClick = function (e) {
      if (_this.state.comesFromDragging) {
        return;
      }

      if (_this.props.onClick) {
        _this.props.onClick(e);
      }
    }; // tslint:disable-next-line: member-ordering


    _this.onTouchStart = function (e) {
      var _e$touches$ = e.touches[0],
          pageX = _e$touches$.pageX,
          pageY = _e$touches$.pageY;

      _this.panStart(pageX, pageY, e);
    }; // tslint:disable-next-line: member-ordering


    _this.onTouchEnd = function () {
      _this.onMouseUp();
    }; // tslint:disable-next-line: member-ordering


    _this.onTouchMove = function (e) {
      _this.updateMousePosition(e.touches[0].pageX, e.touches[0].pageY);
    };

    _this.onMouseDown = function (e) {
      _this.panStart(e.pageX, e.pageY, e);
    };

    _this.panStart = function (pageX, pageY, event) {
      if (!_this.props.enablePan) {
        return;
      }

      var matrixData = _this.state.matrixData;
      var offsetX = matrixData[4];
      var offsetY = matrixData[5];
      var newDragData = {
        dx: offsetX,
        dy: offsetY,
        x: pageX,
        y: pageY
      };

      _this.setState({
        dragData: newDragData,
        mouseDown: true
      });

      if (_this.panWrapper) {
        _this.panWrapper.style.cursor = 'move';
      }

      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      event.preventDefault();
    };

    _this.onMouseUp = function () {
      _this.panEnd();
    };

    _this.panEnd = function () {
      _this.setState({
        comesFromDragging: _this.state.dragging,
        dragging: false,
        mouseDown: false
      });

      if (_this.panWrapper) {
        _this.panWrapper.style.cursor = '';
      }

      if (_this.props.onPan) {
        _this.props.onPan(_this.state.matrixData[4], _this.state.matrixData[5]);
      }
    };

    _this.onMouseMove = function (e) {
      _this.updateMousePosition(e.pageX, e.pageY);
    };

    _this.onWheel = function (e) {
      Math.sign(e.deltaY) < 0 ? _this.props.setZoom((_this.props.zoom || 0) + 0.1) : (_this.props.zoom || 0) > 1 && _this.props.setZoom((_this.props.zoom || 0) - 0.1);
    };

    _this.onMouseEnter = function () {
      document.addEventListener('wheel', _this.preventDefault, {
        passive: false
      });
    };

    _this.onMouseLeave = function () {
      document.removeEventListener('wheel', _this.preventDefault, false);
    };

    _this.updateMousePosition = function (pageX, pageY) {
      if (!_this.state.mouseDown) return;

      var matrixData = _this.getNewMatrixData(pageX, pageY);

      _this.setState({
        dragging: true,
        matrixData: matrixData
      });

      if (_this.panContainer) {
        _this.panContainer.style.transform = "matrix(" + _this.state.matrixData.toString() + ")";
      }
    };

    _this.getNewMatrixData = function (x, y) {
      var _this$state = _this.state,
          dragData = _this$state.dragData,
          matrixData = _this$state.matrixData;
      var deltaX = dragData.x - x;
      var deltaY = dragData.y - y;
      matrixData[4] = dragData.dx - deltaX;
      matrixData[5] = dragData.dy - deltaY;
      return matrixData;
    };

    return _this;
  }

  var _proto = ReactPanZoom.prototype;

  _proto.UNSAFE_componentWillReceiveProps = function UNSAFE_componentWillReceiveProps(nextProps) {
    var matrixData = this.state.matrixData;

    if (matrixData[0] !== nextProps.zoom) {
      var newMatrixData = [].concat(this.state.matrixData);
      newMatrixData[0] = nextProps.zoom || newMatrixData[0];
      newMatrixData[3] = nextProps.zoom || newMatrixData[3];
      this.setState({
        matrixData: newMatrixData
      });
    }
  } // tslint:disable-next-line: member-ordering
  ;

  _proto.render = function render() {
    var _this2 = this;

    return createElement("div", {
      className: "pan-container " + (this.props.className || ''),
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onMouseMove: this.onMouseMove,
      onWheel: this.onWheel,
      onMouseEnter: this.onMouseEnter,
      onMouseLeave: this.onMouseLeave,
      onClick: this.onClick,
      style: {
        height: this.props.height,
        userSelect: 'none',
        width: this.props.width
      },
      ref: function ref(_ref) {
        return _this2.panWrapper = _ref;
      }
    }, createElement("div", {
      ref: function ref(_ref2) {
        return _ref2 ? _this2.panContainer = _ref2 : null;
      },
      style: {
        transform: "matrix(" + this.state.matrixData.toString() + ")"
      }
    }, this.props.children));
  };

  _proto.preventDefault = function preventDefault(e) {
    e = e || window.event;

    if (e.preventDefault) {
      e.preventDefault();
    }

    e.returnValue = false;
  };

  return ReactPanZoom;
}(PureComponent); // In strict null checking setting default props doesn't seem to work. Hence the non-null assertion.
ReactPanZoom.defaultProps = {
  enablePan: true,
  onPan: function onPan() {
    return undefined;
  },
  onReset: function onReset() {
    return undefined;
  },
  pandx: 0,
  pandy: 0,
  zoom: 0,
  rotation: 0
};

var ReactPanZoom$1 = function ReactPanZoom$1(_ref) {
  var image = _ref.image,
      alt = _ref.alt,
      ref = _ref.ref;

  var _React$useState = useState(0),
      dx = _React$useState[0],
      setDx = _React$useState[1];

  var _React$useState2 = useState(0),
      dy = _React$useState2[0],
      setDy = _React$useState2[1];

  var _React$useState3 = useState(1),
      zoom = _React$useState3[0],
      setZoom = _React$useState3[1];

  var _React$useState4 = useState(0),
      rotation = _React$useState4[0],
      setRotation = _React$useState4[1];

  var _React$useState5 = useState(false),
      flip = _React$useState5[0],
      setFlip = _React$useState5[1];

  var resetAll = function resetAll() {
    setDx(0);
    setDy(0);
    setZoom(1);
    setRotation(0);
    setFlip(false);
  };

  var zoomIn = function zoomIn() {
    setZoom(zoom + 0.2);
  };

  var zoomOut = function zoomOut() {
    if (zoom >= 1) {
      setZoom(zoom - 0.2);
    }
  };

  var rotateLeft = function rotateLeft() {
    if (rotation === -3) {
      setRotation(0);
    } else {
      setRotation(rotation - 1);
    }
  };

  var flipImage = function flipImage() {
    setFlip(!flip);
  };

  var onPan = function onPan(dx, dy) {
    setDx(dx);
    setDy(dy);
  };

  return createElement("div", null, createElement("div", {
    style: {
      position: 'absolute',
      right: '10px',
      zIndex: 2,
      top: 10,
      userSelect: 'none',
      borderRadius: 2,
      background: '#fff',
      boxShadow: '0px 2px 6px rgba(53, 67, 93, 0.32)'
    }
  }, createElement("div", {
    onClick: zoomIn,
    style: {
      textAlign: 'center',
      cursor: 'pointer',
      height: 40,
      width: 40,
      borderBottom: ' 1px solid #ccc'
    }
  }, createElement("svg", {
    style: {
      height: '100%',
      width: '100%',
      padding: 10,
      boxSizing: 'border-box'
    },
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, createElement("path", {
    d: "M4 12H20",
    stroke: "#4C68C1",
    strokeWidth: "2",
    strokeLinecap: "round"
  }), createElement("path", {
    d: "M12 4L12 20",
    stroke: "#4C68C1",
    strokeWidth: "2",
    strokeLinecap: "round"
  }))), createElement("div", {
    onClick: zoomOut,
    style: {
      textAlign: 'center',
      cursor: 'pointer',
      height: 40,
      width: 40,
      borderBottom: ' 1px solid #ccc'
    }
  }, createElement("svg", {
    style: {
      height: '100%',
      width: '100%',
      padding: 10,
      boxSizing: 'border-box'
    },
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, createElement("path", {
    d: "M4 12H20",
    stroke: "#4C68C1",
    strokeWidth: "2",
    strokeLinecap: "round"
  }))), createElement("div", {
    onClick: rotateLeft,
    style: {
      textAlign: 'center',
      cursor: 'pointer',
      height: 40,
      width: 40,
      borderBottom: ' 1px solid #ccc'
    }
  }, createElement("svg", {
    style: {
      height: '100%',
      width: '100%',
      padding: 10,
      boxSizing: 'border-box'
    },
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, createElement("path", {
    d: "M14 15L9 20L4 15",
    stroke: "#4C68C1",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), createElement("path", {
    d: "M20 4H13C10.7909 4 9 5.79086 9 8V20",
    stroke: "#4C68C1",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), createElement("div", {
    onClick: flipImage,
    style: {
      textAlign: 'center',
      cursor: 'pointer',
      height: 40,
      width: 40,
      borderBottom: ' 1px solid #ccc'
    }
  }, createElement("svg", {
    style: {
      height: '100%',
      width: '100%',
      padding: 10,
      boxSizing: 'border-box'
    },
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, createElement("path", {
    stroke: "#4C68C1",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M9.178,18.799V1.763L0,18.799H9.178z M8.517,18.136h-7.41l7.41-13.752V18.136z"
  }), createElement("polygon", {
    stroke: "#4C68C1",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    points: "11.385,1.763 11.385,18.799 20.562,18.799 "
  }))), createElement("div", {
    onClick: resetAll,
    style: {
      textAlign: 'center',
      cursor: 'pointer',
      height: 40,
      width: 40
    }
  }, createElement("svg", {
    style: {
      height: '100%',
      width: '100%',
      padding: 10,
      boxSizing: 'border-box'
    },
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: "#4C68C1",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, createElement("path", {
    d: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
  })))), createElement(ReactPanZoom, {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1
    },
    zoom: zoom,
    setZoom: setZoom,
    pandx: dx,
    pandy: dy,
    onPan: onPan,
    rotation: rotation,
    key: dx
  }, createElement("img", {
    style: {
      transform: "rotate(" + rotation * 90 + "deg) scaleX(" + (flip ? -1 : 1) + ")",
      width: '100%'
    },
    src: image,
    alt: alt,
    ref: ref
  })));
};

export default ReactPanZoom$1;
export { ReactPanZoom as PanViewer };
//# sourceMappingURL=react-image-pan-zoom-rotate.esm.js.map
