import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store";
import { PersistGate } from "redux-persist/lib/integration/react";
//import DevicePixelRatio from "./utils/devicePixelRatio";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import { addLoading, cutLoading } from "@/redux/actions/loading";
import Toast from "@/components/global/Toast";
import Confirm from "@/components/global/Confirm";
// console.log("process.env:", process.env);
window.$Toast = Toast;
window.$Confirm = Confirm;
window.$toggleLoading = (bool) => {
  if (bool) {
    store.dispatch(addLoading());
  } else {
    store.dispatch(cutLoading());
  }
};

//new DevicePixelRatio().init();
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,

  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
