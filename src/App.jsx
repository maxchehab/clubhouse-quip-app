import Styles from "./App.less";

const epicRegex = new RegExp(/^https:\/\/app\.clubhouse\.io\/.*\/epic\/(\d+)/);

const CLUBHOUSE_SECRET = "REPLACE CLUBHOUSE SECRET HERE";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    let epicURL,
      epicNumber = this.getEpicNumber(props.providedURL);

    if (typeof epicNumber === "string") {
      epicURL = props.providedURL;
    } else {
      epicURL = props.record.get("epicURL");
      epicNumber = this.getEpicNumber(epicURL);
    }

    this.state = {
      epicURL,
      epicNumber,
      loading: true,
      editing: !Boolean(epicNumber),
    };
  }

  setEpicStats = () => {
    this.setState({ loading: true });

    fetch(
      `https://api.clubhouse.io/api/v3/epics/${this.state.epicNumber}?token=${CLUBHOUSE_SECRET}`,
      {
        method: "GET",
        headers: {
          "Clubhouse-Token": CLUBHOUSE_SECRET,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => this.setState({ epicData: data }))
      .catch((error) => {
        console.log(error);
        this.setState(
          { epicURL: "", epicNumber: undefined, editing: true },
          () => this.props.record.set("epicURL", "")
        );
      })
      .finally(() => this.setState({ loading: false }));
  };

  componentDidUpdate(_prevProps, prevState) {
    if (
      prevState.epicNumber !== this.state.epicNumber &&
      this.state.epicNumber
    ) {
      this.setEpicStats();
    }
  }

  componentDidMount(_prevProps, prevState) {
    if (!prevState && this.state.epicNumber) {
      this.setEpicStats();
    } else {
      this.setState({ loading: false });
    }
  }

  setURL = (e) => {
    const { value } = e.target;

    this.setState({ epicURL: value });
  };

  saveURL = () => {
    const { record } = this.props;
    const { epicURL } = this.state;

    const epicNumber = this.getEpicNumber(epicURL);

    record.set("epicURL", epicURL);

    this.setState({ epicNumber, editing: !Boolean(epicNumber), loading: true });
  };

  getEpicNumber = (value) => {
    const matches = epicRegex.exec(value);

    if (!Array.isArray(matches)) {
      return null;
    }

    return matches[1];
  };

  render() {
    const { epicURL, editing, epicData, loading } = this.state;
    const epicNumber = this.getEpicNumber(epicURL);

    let inProgressPercent, completedPercent;

    if (!editing && !loading) {
      const unStartedStories = epicData.stats.num_stories_unstarted;
      const startedStories = epicData.stats.num_stories_started;
      const completedStories = epicData.stats.num_stories_done;
      const total = unStartedStories + completedStories + startedStories;

      inProgressPercent = Math.round((startedStories / total) * 100);
      completedPercent = Math.round((completedStories / total) * 100);
    }

    return (
      <div className={Styles.app}>
        {editing && (
          <div style={{ display: "flex" }}>
            <input
              className={Styles.input}
              onChange={this.setURL}
              placeholder="https://app.clubhouse.io/workos/epic/1234"
              value={epicURL}
            />

            <button
              className={
                Boolean(epicNumber) ? Styles.button : Styles.disabledButton
              }
              onClick={this.saveURL}
            >
              Save
            </button>
          </div>
        )}

        {loading && <h1>loading...</h1>}

        {!editing && !loading && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p
              className={Styles.title}
              onClick={() => quip.apps.openLink(epicData.app_url)}
            >
              {epicData.name}
            </p>

            <p className={Styles.progressTitle}>
              {completedPercent}% Completed, {inProgressPercent}% In Progress
            </p>

            <div className={Styles.progress}>
              <div
                className={Styles.progressCompleted}
                style={{ width: `${completedPercent}%` }}
              />
              <div
                className={Styles.progressInProgress}
                style={{ width: `${inProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
