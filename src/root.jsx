import quip from "quip";
import App from "./App.jsx";

class BaseRecord extends quip.apps.Record {
  static getProperties = () => ({
    epicURL: "string",
  });
}

quip.apps.registerClass(BaseRecord, "root");

quip.apps.initialize({
  initializationCallback: function(rootNode, params) {
    const providedURL = params.isCreation ? params.creationUrl : undefined;

    ReactDOM.render(
      <App record={quip.apps.getRootRecord()} providedURL={providedURL} />,
      rootNode
    );
  },
});
