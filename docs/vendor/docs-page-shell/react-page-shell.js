/* eslint-disable */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var PropTypes = _interopDefault(require('prop-types'));
var Helmet = require('react-helmet');
var Helmet__default = _interopDefault(Helmet);

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function BrowserCompatibilityWarning() {
  return React.createElement("div", {
    className: "shell-wrapper",
    id: "page-shell-compatibility-warning",
    style: {
      display: 'none'
    },
    "data-swiftype-index": "false"
  }, React.createElement("div", {
    className: "shell-py12 shell-px24 shell-bg-pink shell-color-white shell-align-l"
  }, React.createElement("button", {
    className: "shell-absolute shell-top shell-right shell-p12",
    id: "page-shell-compatibility-dismiss"
  }, React.createElement("svg", {
    className: "shell-icon",
    viewBox: "0 0 18 18"
  }, React.createElement("path", {
    d: "M5.8,5C5.4,5,5,5.4,5,5.8C5,6,5.1,6.2,5.3,6.3l0,0L7.9,9l-2.6,2.6C5.1,11.8,5,12,5,12.2C5,12.6,5.4,13,5.8,13 c0.2,0,0.4-0.1,0.6-0.3L9,10.1l2.6,2.6c0.1,0.2,0.4,0.3,0.6,0.3c0.4,0,0.8-0.4,0.8-0.8c0-0.2-0.1-0.4-0.2-0.6L10.1,9l2.6-2.7 C12.9,6.2,13,6,13,5.8C13,5.4,12.6,5,12.2,5c-0.2,0-0.4,0.1-0.6,0.2L9,7.8L6.4,5.2C6.2,5.1,6,5,5.8,5L5.8,5z"
  }))), React.createElement("div", {
    className: "limiter shell-block shell-relative"
  }, React.createElement("div", {
    className: "compatibility-warning-copy shell-mb6 shell-mb0-mm shell-align-center shell-align-l-mm shell-txt-bold"
  }, "You are using an outdated browser and will encounter some problems with our website. Please consider upgrading."), React.createElement("div", {
    className: "compatibility-warning-action shell-align-center"
  }, React.createElement("a", {
    className: "shell-btn shell-btn--white shell-color-pink shell-txt-nowrap",
    href: "http://outdatedbrowser.com"
  }, "Upgrade Now")))));
}

function PageHelmet() {
  return React.createElement(Helmet.Helmet, null, React.createElement("meta", {
    charSet: "utf-8"
  }), React.createElement("meta", {
    name: "viewport",
    content: "width=device-width, initial-scale=1"
  }), React.createElement("link", {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/maplibre-gl-js-docs/assets/favicon/apple-touch-icon.png?v=rMBbQAR5BL"
  }), React.createElement("link", {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/maplibre-gl-js-docs/assets/favicon/favicon-32x32.png?v=rMBbQAR5BL"
  }), React.createElement("link", {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/maplibre-gl-js-docs/assets/favicon/favicon-16x16.png?v=rMBbQAR5BL"
  }), React.createElement("link", {
    rel: "manifest",
    href: "/maplibre-gl-js-docs/assets/favicon/site.webmanifest?v=rMBbQAR5BL"
  }), React.createElement("link", {
    rel: "mask-icon",
    href: "/maplibre-gl-js-docs/assets/favicon/safari-pinned-tab.svg?v=rMBbQAR5BL",
    color: "#4264fb"
  }), React.createElement("link", {
    rel: "shortcut icon",
    href: "/maplibre-gl-js-docs/assets/favicon/favicon.ico?v=rMBbQAR5BL"
  }), React.createElement("meta", {
    name: "msapplication-TileColor",
    content: "#ffffff"
  }), React.createElement("meta", {
    name: "msapplication-config",
    content: "/maplibre-gl-js-docs/assets/favicon/browserconfig.xml?v=rMBbQAR5BL"
  }), React.createElement("meta", {
    name: "theme-color",
    content: "#ffffff"
  }), React.createElement("meta", {
    name: "twitter:site",
    content: "@MapLibre"
  }), React.createElement("meta", {
    property: "og:site_name",
    content: "MapLibre"
  }));
}

var shellStyles = {
  // Header names
  headerMenuName: 'shell-txt-s shell-txt-s-mxl shell-txt-bold shell-txt-nowrap shell-py6',
  // Medium to X-large navigation
  navigationItem: 'shell-mx6 shell-mx9-ml shell-mx18-mxl',
  // User menu popup
  userNavLink: 'shell-color-gray-dark shell-color-blue-on-hover shell-txt-s shell-txt-bold shell-my12 shell-block',
  userAvatar: 'shell-border shell-border--2 shell-border--white shell-h30 shell-w30 shell-bg-darken25 shell-clip shell-round-full'
};

function NavigationItem(props) {
  var colorBasedClasses = props.darkText ? 'shell-navigation-menu-button shell-color-gray-dark shell-color-blue-on-hover' : 'shell-navigation-menu-button shell-link shell-link--white';
  return React.createElement("div", {
    className: "shell-flex-child ".concat(shellStyles.navigationItem),
    style: {
      lineHeight: 1
    }
  }, React.createElement("a", {
    className: "shell-py6 shell-txt-s shell-txt-bold ".concat(colorBasedClasses),
    href: props.href
  }, props.children));
}

NavigationItem.propTypes = {
  darkText: PropTypes.bool,
  href: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired
};

function MobileMenuButton(props) {
  var menuButtonClasses = 'shell-block';

  if (!props.darkText) {
    menuButtonClasses += ' shell-link shell-link--white';
  } else {
    menuButtonClasses += ' shell-color-blue';
  }

  return React.createElement("button", {
    id: "mobile-nav-trigger-toggle",
    "aria-label": "Toggle navigation",
    className: menuButtonClasses,
    "data-test": "mobile-nav-trigger-toggle"
  }, React.createElement("svg", {
    id: "mobile-nav-trigger-menu",
    viewBox: "0 0 18 18",
    className: "shell-mobile-nav__trigger shell-icon shell-transition shell-icon--l"
  }, React.createElement("g", null, React.createElement("path", {
    className: "shell-mobile-nav__trigger__bar--top",
    d: "M4.2,6h9.6C14.5,6,15,5.6,15,5s-0.5-1-1.2-1H4.2C3.5,4,3,4.4,3,5S3.5,6,4.2,6z"
  }), React.createElement("path", {
    className: "shell-mobile-nav__trigger__bar--middle",
    d: "M13.8,8H4.2C3.5,8,3,8.4,3,9s0.5,1,1.2,1h9.6c0.7,0,1.2-0.4,1.2-1S14.5,8,13.8,8z"
  }), React.createElement("path", {
    className: "shell-mobile-nav__trigger__bar--bottom",
    d: "M13.8,12H4.2C3.5,12,3,12.4,3,13s0.5,1,1.2,1h9.6c0.7,0,1.2-0.4,1.2-1S14.5,12,13.8,12z"
  }))));
}

MobileMenuButton.propTypes = {
  darkText: PropTypes.bool
};

var language = "en";
var logoSiteTitle = "Docs";
var all = "MapLibre";
var nav = [
];
var navigationMenuData = {
	language: language,
	logoSiteTitle: logoSiteTitle,
	all: all,
	nav: nav
};

var ORIGIN_DOCS_PRODUCTION = 'https://maplibre.org/maplibre-gl-js-docs';
var DEFAULT_SOCIAL_IMAGE_URL = 'https://static-assets.mapbox.com/branding/social/social-1200x630.v1.png';
var DEFAULT_SOCIAL_IMAGE_THUMBNAIL_URL = 'https://static-assets.mapbox.com/branding/social/social-120x120.v1.png';

var MOBILE_HEADER_HEIGHT = 72;

function MobileNavigation() {
  return React.createElement("div", {
    className: "shell-z1 shell-absolute shell-top shell-left shell-right shell-w-full"
  }, React.createElement("div", {
    id: "mobile-nav-backdrop",
    "data-test": "mobile-nav-backdrop",
    className: "shell-absolute shell-bottom shell-left shell-right shell-mobile-nav__backdrop",
    style: {
      top: MOBILE_HEADER_HEIGHT,
      backgroundImage: "linear-gradient(to bottom, transparent, rgba(31, 51, 73, .5))"
    }
  }), React.createElement("div", {
    id: "mobile-nav-menu",
    "data-test": "mobile-nav-menu",
    className: "shell-absolute shell-z5 shell-w-full shell-animated-menu",
    style: {
      top: 0,
      right: 0
    }
  }, React.createElement("div", {
    className: "shell-shadow-darken10-bold shell-bg-white shell-clip shell-px24",
    style: {
      paddingTop: MOBILE_HEADER_HEIGHT
    }
  }, React.createElement("div", {
    className: "shell-pb24"
  }, navigationMenuData.nav.map(function (nav$$1) {
    return React.createElement("a", {
      key: nav$$1.href,
      href: nav$$1.href,
      className: "block shell-py6"
    }, nav$$1.title);
  })), React.createElement("div", {
    className: "shell-border-t shell-border--gray-light shell-py24"
  }, React.createElement("a", {
    href: ORIGIN_DOCS_PRODUCTION,
    className: "shell-color-blue"
  }, navigationMenuData.all)))));
}

function Logo(props) {
  var darkText = props.darkText,
      mini = props.mini;
  var logoClasses = 'shell-flex-child shell-mb-logo';

  if (!darkText) {
    logoClasses += ' shell-mb-logo--white';
  }

  var logoStyles = {};

  if (mini) {
    logoStyles.width = 30;
    logoStyles.height = 42;
    logoStyles.backgroundSize = '132px 42px';
  }

  var border = null;

  if (!mini) {
    var borderClasses = 'shell-flex-child shell-h24 shell-mx12';
    borderClasses += darkText ? ' shell-bg-blue' : ' shell-bg-white';
    border = React.createElement("div", {
      className: borderClasses,
      style: {
        width: 2
      },
      "data-subtitle-bar-dark": darkText
    });
  }

  var nameClasses = 'shell-flex-child shell-txt-bold ';
  nameClasses += 'shell-txt-l ';
  nameClasses += darkText ? ' shell-color-blue shell-color-blue-dark-on-hover' : ' shell-link shell-link--white';

  if (mini) {
    nameClasses += ' shell-ml6';
  }

  return React.createElement("div", {
    className: "shell-flex-parent shell-flex-parent--center-cross"
  }, React.createElement("a", {
    href: "https://www.maplibre.org",
    "aria-label": "MapLibre",
    className: logoClasses,
    style: logoStyles
  }), border, React.createElement("a", {
    href: ORIGIN_DOCS_PRODUCTION,
    className: nameClasses,
    style: {
      marginBottom: 2
    },
    "data-subtitle-dark": darkText
  }, navigationMenuData.logoSiteTitle));
}

Logo.propTypes = {
  darkText: PropTypes.bool,
  mini: PropTypes.bool
};
Logo.defaultProps = {
  darkText: false,
  mini: false
};

var USER_MENU_WIDTH = 66;

function PageHeader(props) {
  var logoOverlay = null;

  if (!props.darkText) {
    logoOverlay = React.createElement("div", {
      className: "shell-mobile-nav__logo--overlay shell-absolute shell-top shell-left"
    }, React.createElement(Logo, {
      darkText: true,
      mini: true
    }));
  }

  return React.createElement("header", {
    className: "shell-absolute shell-w-full shell-z1",
    "data-swiftype-index": "false"
  }, React.createElement("div", {
    className: "shell-none limiter limiter--wide shell-mt24 shell-flex-parent-mm shell-flex-parent--center-cross"
  }, React.createElement(Logo, {
    darkText: props.darkText
  }), React.createElement("div", {
    className: "shell-flex-child shell-flex-child--grow shell-flex-parent shell-flex-parent--center-cross shell-flex-parent--end-main"
  }, React.createElement("div", {
    className: "shell-flex-parent shell-flex-parent--center-cross shell-flex-parent--end-main"
  }, navigationMenuData.nav.map(function (nav$$1) {
    return React.createElement(NavigationItem, {
      key: nav$$1.href,
      href: nav$$1.href,
      darkText: props.darkText
    }, nav$$1.title);
  }))), React.createElement("div", {
    className: "shell-flex-child shell-ml6 shell-ml12-ml shell-ml18-mxl"
  })), React.createElement("div", {
    id: "page-header-content",
    className: "shell-none-mm limiter shell-py12 shell-z2 shell-relative"
  }, React.createElement("div", {
    className: "shell-flex-parent shell-flex-parent--center-cross"
  }, React.createElement("div", {
    className: "shell-flex-child shell-flex-child--no-shrink shell-ml-neg6"
  }, React.createElement(MobileMenuButton, {
    darkText: props.darkText
  })), React.createElement("div", {
    className: "shell-flex-child shell-flex-child--grow shell-relative shell-mb-logo__wrapper shell-ml12"
  }, React.createElement(Logo, {
    darkText: props.darkText,
    mini: true
  }), logoOverlay), React.createElement("div", {
    className: "shell-flex-child shell-flex-child--no-shrink"
  }))), React.createElement(MobileNavigation, null));
}

PageHeader.propTypes = {
  darkText: PropTypes.bool
};
PageHeader.defaultProps = {
  darkText: false
};

function FooterLegalStrip(props) {
  return React.createElement("div", {
    className: props.className
  }, React.createElement("a", {
    className: "shell-link shell-color-gray shell-color-gray-dark-on-hover shell-mr18",
    href: "https://maplibre.org/"
  }, "MapLibre"));
}

FooterLegalStrip.propTypes = {
  className: PropTypes.string
};

function FooterSocialMediaStrip(props) {
  return React.createElement("div", {
    className: props.className
  }, React.createElement("a", {
    "aria-label": "Github",
    className: "shell-color-blue shell-color-blue-dark-on-hover shell-inline-block shell-w36",
    href: "https://github.com/maplibre"
  }, React.createElement("svg", {
    viewBox: "0 0 1790 1790",
    className: "shell-icon shell-icon--s shell-inline"
  }, React.createElement("path", {
    d: "M704 1216q0 40-12.5 82t-43 76-72.5 34-72.5-34-43-76-12.5-82 12.5-82 43-76 72.5-34 72.5 34 43 76 12.5 82zm640 0q0 40-12.5 82t-43 76-72.5 34-72.5-34-43-76-12.5-82 12.5-82 43-76 72.5-34 72.5 34 43 76 12.5 82zm160 0q0-120-69-204t-187-84q-41 0-195 21-71 11-157 11t-157-11q-152-21-195-21-118 0-187 84t-69 204q0 88 32 153.5t81 103 122 60 140 29.5 149 7h168q82 0 149-7t140-29.5 122-60 81-103 32-153.5zm224-176q0 207-61 331-38 77-105.5 133t-141 86-170 47.5-171.5 22-167 4.5q-78 0-142-3t-147.5-12.5-152.5-30-137-51.5-121-81-86-115q-62-123-62-331 0-237 136-396-27-82-27-170 0-116 51-218 108 0 190 39.5t189 123.5q147-35 309-35 148 0 280 32 105-82 187-121t189-39q51 102 51 218 0 87-27 168 136 160 136 398z"
  }))), React.createElement("a", {
    "aria-label": "Twitter",
    className: "shell-color-blue shell-color-blue-dark-on-hover shell-inline-block shell-w36",
    href: "https://twitter.com/maplibre/"
  }, React.createElement("svg", {
    viewBox: "0 0 50 50",
    className: "shell-icon shell-icon--s shell-inline"
  }, React.createElement("g", {
    id: "77744030-a5d8-4d71-88ad-2c70d4dcad7b",
    "data-name": "svg"
  }, React.createElement("path", {
    d: "M15.72,45.31c18.87,0,29.19-15.63,29.19-29.19,0-.44,0-.89,0-1.33A20.87,20.87,0,0,0,50,9.49a20.48,20.48,0,0,1-5.89,1.61,10.29,10.29,0,0,0,4.51-5.67A20.56,20.56,0,0,1,42.1,7.92a10.27,10.27,0,0,0-17.48,9.36A29.12,29.12,0,0,1,3.48,6.56,10.27,10.27,0,0,0,6.66,20.25,10.18,10.18,0,0,1,2,19v.13a10.26,10.26,0,0,0,8.23,10.06,10.24,10.24,0,0,1-4.63.18,10.27,10.27,0,0,0,9.58,7.12,20.58,20.58,0,0,1-12.74,4.4A20.88,20.88,0,0,1,0,40.71a29,29,0,0,0,15.72,4.6"
  })))));
}

FooterSocialMediaStrip.propTypes = {
  className: PropTypes.string
};

function PageFooter() {
  return React.createElement("footer", {
    id: "page-footer",
    className: "shell-py12 shell-py48-ml",
    "data-swiftype-index": "false"
  }, React.createElement("div", {
    className: "limiter limiter--wide"
  }, React.createElement("div", {
    id: "page-footer-legal-social",
    className: "shell-grid shell-txt-s shell-color-gray shell-py12 shell-py0-ml"
  }, React.createElement(FooterLegalStrip, {
    className: "shell-col shell-col--12 shell-col--6-mm shell-my12"
  }), React.createElement(FooterSocialMediaStrip, {
    className: "shell-col shell-col--12 shell-col--6-mm shell-my12 shell-align-r-mm"
  }))));
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var titleGenerator_1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.titleGenerator = titleGenerator;
var contextlessTitles = ['Introduction', 'Overview', 'Guides'];

function titleGenerator(title, subsite, site) {
  // create array for formatted title: {title} | {subsite} | {site}
  var titleArr = []; // do not push a title that is "Introduction" or "Overview"

  if (title && contextlessTitles.indexOf(title) === -1 && ( // do not push a title that lacks context
  subsite || site)) titleArr.push(title); // push subsite, if same value doesn't exist yet, strip "for (Product)" from name

  if (subsite && titleArr.indexOf(subsite) === -1) titleArr.push(subsite.replace(/\sfor\s(iOS|Android|Vision|Unity)/, '')); // push site, if same value doesn't exist yet

  if (site && titleArr.indexOf(site) === -1) titleArr.push(site);
  return titleArr;
}
});

unwrapExports(titleGenerator_1);
var titleGenerator_2 = titleGenerator_1.titleGenerator;

var removeMarkdown = function (md, options) {
  options = options || {};
  options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar') ? options.listUnicodeChar : false;
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
  options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;
  options.useImgAltText = options.hasOwnProperty('useImgAltText') ? options.useImgAltText : true;
  var output = md || ''; // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)

  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, '');

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar) output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, options.listUnicodeChar + ' $1');else output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
    }

    if (options.gfm) {
      output = output // Header
      .replace(/\n={2,}/g, '\n') // Fenced codeblocks
      .replace(/~{3}.*\n/g, '') // Strikethrough
      .replace(/~~/g, '') // Fenced codeblocks
      .replace(/`{3}.*\n/g, '');
    }

    output = output // Remove HTML tags
    .replace(/<[^>]*>/g, '') // Remove setext-style headers
    .replace(/^[=\-]{2,}\s*$/g, '') // Remove footnotes?
    .replace(/\[\^.+?\](\: .*?$)?/g, '').replace(/\s{0,2}\[.*?\]: .*?$/g, '') // Remove images
    .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '') // Remove inline links
    .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1') // Remove blockquotes
    .replace(/^\s{0,3}>\s?/g, '') // Remove reference-style links?
    .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '') // Remove atx-style headers
    .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3') // Remove emphasis (repeat the line to remove double emphasis)
    .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2').replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2') // Remove code blocks
    .replace(/(`{3,})(.*?)\1/gm, '$2') // Remove inline code
    .replace(/`(.+?)`/g, '$1') // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
    .replace(/\n{2,}/g, '\n\n');
  } catch (e) {
    console.error(e);
    return md;
  }

  return output;
};

function MetaTagger(props) {
  var title = titleGenerator_2(props.title, props.subsite, props.site).join(' | ');
  var suffixedTitle = "".concat(title, " | MapLibre");
  var preppedDescription = props.description.replace(/\s+/g, ' ');
  var prodUrl = 'https://maplibre.org';
  if (props.pathname[0] !== '/') prodUrl += '/';
  prodUrl += props.pathname;
  var metaItems = [{
    name: 'description',
    content: removeMarkdown(preppedDescription)
  }];
  metaItems.push({
    name: 'twitter:title',
    content: title
  }, {
    property: 'og:title',
    content: title
  }, {
    name: 'twitter:description',
    content: removeMarkdown(preppedDescription)
  }, {
    property: 'og:description',
    content: removeMarkdown(preppedDescription)
  }, {
    property: 'og:url',
    content: prodUrl
  }, {
    property: 'og:type',
    content: 'website'
  }, {
    class: 'swiftype',
    name: 'title',
    'data-type': 'string',
    content: props.title
  }, {
    class: 'swiftype',
    name: 'excerpt',
    'data-type': 'string',
    content: removeMarkdown(props.description)
  }, {
    name: 'twitter:image:alt',
    content: props.imageAlt
  }, {
    property: 'og:image',
    content: props.imageUrl
  }, {
    class: 'swiftype',
    name: 'image',
    'data-type': 'enum',
    content: props.imageUrl
  }, {
    class: 'swiftype',
    name: 'site',
    'data-type': 'string',
    content: props.site
  });

  if (props.subsite) {
    metaItems.push({
      class: 'swiftype',
      name: 'subsite',
      'data-type': 'string',
      content: props.subsite
    });
  }

  if (props.contentType) {
    metaItems.push({
      class: 'swiftype',
      name: 'contentType',
      'data-type': 'string',
      content: props.contentType
    });
  }

  if (props.language) {
    props.language.forEach(function (language) {
      metaItems.push({
        class: 'swiftype',
        name: 'codeLanguage',
        'data-type': 'string',
        content: language
      });
    });
  }

  if (props.level) {
    metaItems.push({
      class: 'swiftype',
      name: 'level',
      'data-type': 'string',
      content: props.level
    });
  }

  if (props.largeImage) {
    metaItems.push({
      name: 'twitter:card',
      content: 'summary_large_image'
    }, {
      name: 'twitter:image',
      content: props.imageUrl
    });
  } else {
    metaItems.push({
      name: 'twitter:card',
      content: 'summary'
    }, {
      name: 'twitter:image',
      content: props.imageUrlThumbnail
    });
  }

  if (props.hideFromSearchEngines) {
    metaItems.push({
      name: 'robots',
      content: 'noindex, nofollow'
    });
  }

  return React.createElement(Helmet__default, {
    title: suffixedTitle,
    meta: metaItems
  });
}

MetaTagger.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
  site: PropTypes.string.isRequired,
  subsite: PropTypes.string,
  contentType: PropTypes.string,
  imageUrl: PropTypes.string,
  imageUrlThumbnail: PropTypes.string,
  imageAlt: PropTypes.string,
  largeImage: PropTypes.bool,
  language: PropTypes.array,
  level: PropTypes.number,
  hideFromSearchEngines: PropTypes.bool
};
MetaTagger.defaultProps = {
  imageUrl: DEFAULT_SOCIAL_IMAGE_URL,
  imageUrlThumbnail: DEFAULT_SOCIAL_IMAGE_THUMBNAIL_URL,
  imageAlt: 'MapLibre',
  largeImage: true
};

var lastUrl;

var ReactPageShell =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ReactPageShell, _React$Component);

  function ReactPageShell() {
    _classCallCheck(this, ReactPageShell);

    return _possibleConstructorReturn(this, _getPrototypeOf(ReactPageShell).apply(this, arguments));
  }

  _createClass(ReactPageShell, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (!window.MapboxPageShell) throw new Error('MapboxPageShell not loaded');
      this.initialize();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var currentUrl = window.location.href;
      if (currentUrl === lastUrl) return;
      lastUrl = currentUrl;
      this.initialize();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      MapboxPageShell.removeNavigation();
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this = this;

      MapboxPageShell.initialize();
    }
  }, {
    key: "render",
    value: function render() {
      var nonFooterClasses = 'shell-flex-child shell-flex-child--grow shell-flex-child--no-shrink';

      if (this.props.nonFooterBgClass) {
        nonFooterClasses += " ".concat(this.props.nonFooterBgClass);
      }

      return React.createElement("div", {
        id: "page-shell"
      }, React.createElement(BrowserCompatibilityWarning, null), React.createElement("div", {
        className: "shell-flex-parent shell-flex-parent--column",
        style: {
          minHeight: '100vh'
        }
      }, React.createElement(PageHelmet, null), React.createElement(MetaTagger, _extends({}, this.props.meta, {
        site: this.props.site,
        subsite: this.props.subsite
      })), React.createElement("div", {
        className: nonFooterClasses
      }, React.createElement("div", {
        className: "shell-wrapper"
      }, React.createElement(PageHeader, {
        darkText: this.props.darkHeaderText
      })), React.createElement("main", {
        role: "main",
        style: {
          zIndex: 0,
          position: 'relative',
          display: 'block'
        }
      }, this.props.children)), React.createElement("div", {
        className: "shell-flex-child shell-flex-child--no-shrink shell-wrapper"
      }, React.createElement(PageFooter, null))));
    }
  }]);

  return ReactPageShell;
}(React.Component);

ReactPageShell.propTypes = {
  meta: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    contentType: PropTypes.string,
    pathname: PropTypes.string,
    level: PropTypes.number,
    codeLanguage: PropTypes.array,
    hideFromSearchEngines: PropTypes.bool
  }).isRequired,
  children: PropTypes.node.isRequired,
  site: PropTypes.string.isRequired,
  subsite: PropTypes.string,
  darkHeaderText: PropTypes.bool,
  nonFooterBgClass: PropTypes.string,
  onUser: PropTypes.func
};
ReactPageShell.defaultProps = {
  darkHeaderText: false
};

module.exports = ReactPageShell;
