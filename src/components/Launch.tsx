import {
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonGrid,
  IonIcon,
  IonItem,
  IonProgressBar,
  IonSearchbar,
  IonToggle,
} from "@ionic/react";
import "./Launch.css";
import FeaturedLaunches from "./subcomponents/FeaturedLaunch";
import LaunchGridRow from "./subcomponents/LaunchGridRow";
import { useEffect, useState } from "react";
import { repeatedFunctions } from "../hooks/repeatedFunctions";
import localforage from "localforage";
import Countdown from "./subcomponents/Countdown";

export default function Launch(props: any) {
  const { devMode, useDevApi } = props;

  let loadingImages = [
    "https://cdn.dribbble.com/users/2882885/screenshots/7861928/media/a4c4da396c3da907e7ed9dd0b55e5031.gif",
    "https://media.tenor.com/DHkIdy0a-UkAAAAC/loading-cat.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGZoODhpYm5hM2V6ZGdidGRtYnM3MnliaHRoeWR2dmJrM3g3bHltdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/mFTRCmlZgMEr5CHmOV/giphy.gif",
    "https://64.media.tumblr.com/bdaea39db57dc0b48d763262514268db/tumblr_mgj44mNyST1s199fdo1_500.gif",
    "https://cdn.dribbble.com/users/160117/screenshots/3197970/main.gif",
  ];

  const { monthAsWordUTC } = repeatedFunctions();


  function forceAPICall() {
    let password = window.prompt(
      "Enter password to force refresh (hint: check GitHub code)",
      ""
    );

    if (password == "123456789") {
      localforage.removeItem('dataPastDate');
      localforage.removeItem('dataFutureDate');
      localforage.removeItem('dataPast');
      localforage.removeItem('dataFuture');
      location.reload();
    } else if (password == "clear") {
      localforage.clear();
      location.reload();
    }
  }

  const getAgency = (agencies: any) => {
    if (agencies.length == 0) {
      return "";
    } else {
      let list = "";
      // console.log(agencies)
      for (let agency of agencies) {
        //  console.log(agency.name)
        list += agency.name + "";
      }

      return list;
    }
  };

  const getAbbrev = (agencies: any) => {
    if (agencies.length == 0) {
      return "";
    } else {
      let list = "";
      // console.log(agencies)
      for (let agency of agencies) {
        //  console.log(agency.name)
        list += agency.abbrev + "";
      }

      return list;
    }
  };

  function hasMonthChanged(currentDate: any, previousDate: any) {
    if (currentDate.net_precision && previousDate.net_precision)
      if (currentDate.net_precision.id >= 8)
        return currentDate.net_precision.id !== previousDate.net_precision.id;
      else
        return (
          new Date(currentDate.net).getUTCMonth() !==
          new Date(previousDate.net).getUTCMonth()
        );
    else
      return (
        new Date(currentDate.net).getUTCMonth() !==
        new Date(previousDate.net).getUTCMonth()
      );
  }

  const displayLaunches = (props: any) => {
    let { launches, date, dataName } = props;

    if (launches.length > 0) {
      if (dataName != "dataPast") {
        // filters out any launches that alr happened; success, failure, or partial
        launches = launches.filter((val: any) => {
          return !(
            val.status.id == 7 ||
            val.status.id == 4 ||
            val.status.id == 3
          );
        });
      }

      let featuredLaunch = launches[0];
      //  console.log(featuredLaunch);
      let displayedLaunches = launches.slice(1);
      //  console.log(displayedLaunches);

      let [results, setResults] = useState([...displayedLaunches]);

      const handleInput = (ev: Event) => {

        let query = "";
        const target = ev?.target as HTMLIonSearchbarElement;
        if (target) query = target.value!.toLowerCase();

        setResults(
          displayedLaunches.filter(
            (d: any) =>
              d.name.toLowerCase().indexOf(query) > -1 ||
              d.launch_service_provider.name.toLowerCase().indexOf(query) >
              -1 ||
              d.pad.name.toLowerCase().indexOf(query) > -1 ||
              d.pad.location.name.toLowerCase().indexOf(query) > -1 ||
              monthAsWordUTC(d.net).toLowerCase().indexOf(query) > -1 ||
              d.status.abbrev.toLowerCase().indexOf(query) > -1 ||
              getAgency(d.mission ? d.mission.agencies : []).toLowerCase().indexOf(query) > -1 ||
              getAbbrev(d.mission ? d.mission.agencies : []).toLowerCase().indexOf(query) > -1
          )
        );
      };

      console.log("rendering..");

      // useEffect( () => {setResults([...displayedLaunches])} );

      return (
        <>
          <IonGrid>
            {devMode ? (
              <IonItem>
                DEV MODE ON; Time since page opened/dev mode on:{" "}
                <Countdown launchDate={new Date()} inline={true}></Countdown>
              </IonItem>
            ) : (
              <></>
            )}

            <IonItem className="rows">
              <h1>Featured Launch:</h1>
            </IonItem>

            <FeaturedLaunches launch={featuredLaunch}></FeaturedLaunches>

            <IonItem className="rows">
              <h1>Other Launches:</h1>
            </IonItem>

            <IonSearchbar
              placeholder="Search (launch vehicle, mission agency, etc.)"
              debounce={1}
              onIonInput={(ev) => handleInput(ev)}
            ></IonSearchbar>

            {results.map((launch: any, index: number, array) => {
              const isFirstElement = index === 0;
              const previousDate = isFirstElement ? null : array[index - 1];
              const monthChanged = isFirstElement
                ? true
                : hasMonthChanged(launch, previousDate);

              // launch.program.length > 0 ? console.log(launch.name, launch.program) : console.log("empty")

              if (monthChanged) {
                let monthInWords =
                  new Date(launch.net).toLocaleString("en-US", {
                    month: "long",
                    timeZone: "UTC",
                  }) +
                  " " +
                  new Date(launch.net).getUTCFullYear();

                if (launch.net_precision)
                  if (launch.net_precision.id >= 8)
                    monthInWords =
                      launch.net_precision.name +
                      " (~" +
                      monthAsWordUTC(launch.net) +
                      " " +
                      new Date(launch.net).getUTCFullYear() +
                      ")";

                return (
                  <div key={launch.id}>
                    <IonItem className="rows" style={{ fontWeight: "bold" }}>
                      {monthInWords}
                    </IonItem>
                    <LaunchGridRow
                      launch={launch}
                      devMode={devMode}
                    ></LaunchGridRow>
                  </div>
                );
              } else {
                return (
                  <LaunchGridRow
                    launch={launch}
                    key={launch.id}
                    devMode={devMode}
                  ></LaunchGridRow>
                );
              }
            })}

            <IonItem className="rows">
              <h1>Attributions:</h1>
            </IonItem>
            <IonItem className="rows">
              <p className="ion-label">
                All data courtesy of thespacedevs's API.{" "}
                <a href="https://lldev.thespacedevs.com/docs/">
                  See their website for more info
                </a>
                . API last contacted{" "}
                {date ? date.toString() : "Error getting date"}. Created in
                Ionic React, see{" "}
                <a href="https://github.com/OkayKenji/Data/">code here</a>.{" "}
                <button
                  onClick={() => {
                    location.reload();
                  }}
                >
                  Refresh Page
                </button>
                {devMode ? (
                  <>
                    <button onClick={() => forceAPICall()}>
                      Purge all API data
                    </button>
                    <input id="offset" type="number" >

                    </input>
                    <button onClick={() => {
                      console.log(document.getElementById("offset")?.value)

                      let offset = Number.isNaN(Number.parseInt(document.getElementById("offset")?.value)) ? 0 : Number.parseInt(document.getElementById("offset")?.value)
                      localforage
                        .setItem("offset", offset);

                      forceAPICall();

                    }}>Refresh data with offset</button>
                    <IonCheckbox checked={useDevApi} onIonChange={(event: CustomEvent) => {
                      console.log(event.detail.checked)

                      localforage
                        .setItem("useDevApi", event.detail.checked);
                    }}>Use Dev API on Next Reload</IonCheckbox>
                    <button onClick={() => { forceAPICall() }}>Clear ALL data</button>
                  </>

                ) : (
                  <></>
                )}
              </p>
            </IonItem>
          </IonGrid>
        </>
      );
    } else {
      return (
        <IonGrid>
          <IonProgressBar type="indeterminate" color="primary"></IonProgressBar>{" "}
          <h3>
            Loading Launches...this may take a while as we contact the
            thespacedevs API.
          </h3>
          <img
            src={
              loadingImages[Math.floor(Math.random() * loadingImages.length)]
            }
          ></img>
          <IonProgressBar type="indeterminate" color="primary"></IonProgressBar>
        </IonGrid>
      );
    }
  };

  return <>{displayLaunches(props)}</>;
}
