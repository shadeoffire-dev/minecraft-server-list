import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
import NProgress from "nprogress";
import Router from "next/router";
import Head from "next/head";
import ReactGA from "react-ga";
import "../public/css/styles.css";

ReactGA.initialize("UA-144570559-1");

Router.events.on("routeChangeStart", url => {
  ReactGA.pageview(url);
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => {
  NProgress.done();
});
Router.events.on("routeChangeError", () => NProgress.done());

import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import App from "next/app";
import withRedux from "next-redux-wrapper";
import rootReducer from "../src/reducers";

/**
 * @param {object} initialState The store's initial state (on the client side, the state of the server-side store is passed here)
 * @param {boolean} options.isServer Indicates whether makeStore is executed on the server or the client side
 * @param {Request} options.req Node.js `Request` object (only set before `getInitialProps` on the server side)
 * @param {Response} options.res Node.js `Response` object (only set before `getInitialProps` on the server side)
 * @param {boolean} options.debug User-defined debug flag
 * @param {string} options.storeKey The key that will be used to persist the store in the browser's `window` object for safe HMR
 */
const makeStore = (initialState, options) => {
  return createStore(rootReducer, initialState);
};

class Ironeko extends App {
  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Site>
          <Head>
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NFVHD8T');`
              }}
            ></script>
          </Head>
          <Component {...pageProps} />
        </Site>
      </Provider>
    );
  }
}

const Site = connect(state => ({
  dimensions: state.dimensions
}))(SiteContainer);

function SiteContainer({ children, dispatch }) {
  const targetRef = useRef();

  // holds the timer for setTimeout and clearInterval
  let movement_timer = null;

  // the number of ms the window size must stay the same size before the
  // dimension state variable is reset
  const RESET_TIMEOUT = 100;

  const test_dimensions = () => {
    // For some reason targetRef.current.getBoundingClientRect was not available
    // I found this worked for me, but unfortunately I can't find the
    // documentation to explain this experience
    if (targetRef.current) {
      dispatch({
        type: "SET_DIMENSIONS",
        action: {
          width: targetRef.current.offsetWidth,
          height: targetRef.current.offsetHeight
        }
      });
    }
  };

  // This sets the dimensions on the first render
  useLayoutEffect(() => {
    test_dimensions();
  }, []);

  // every time the window is resized, the timer is cleared and set again
  // the net effect is the component will only reset after the window size
  // is at rest for the duration set in RESET_TIMEOUT.  This prevents rapid
  // redrawing of the component for more complex components such as charts
  useEffect(() => {
    window.addEventListener("resize", () => {
      clearInterval(movement_timer);
      movement_timer = setTimeout(test_dimensions, RESET_TIMEOUT);
    });
    return () =>
      window.addEventListener("resize", () => {
        clearInterval(movement_timer);
        movement_timer = setTimeout(test_dimensions, RESET_TIMEOUT);
      });
  });

  return (
    <div className={"main-grid"} ref={targetRef}>
      {children}
    </div>
  );
}

export default withRedux(makeStore)(Ironeko);
