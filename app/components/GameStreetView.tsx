"use client";

import { useApi } from "@/hooks/useApi";
import type { GooglePanoramaCandidate } from "@/types/google";
import React from "react";

type StreetViewState =
  | {
    kind: "loading";
    title: string;
    message: string;
  }
  | {
    kind: "ready";
  }
  | {
    kind: "error";
    title: string;
    message: string;
  };

interface GameStreetViewProps {
  panoramaId?: string | null;
  onPanoramaLoaded?: (candidate: GooglePanoramaCandidate) => void;
}

interface GoogleMapsApi {
  importLibrary(name: "streetView"): Promise<StreetViewLibrary>;
}

interface GoogleMapsWindow extends Window {
  google?: {
    maps?: GoogleMapsApi;
  };
  __initGameStreetViewGoogleMaps?: () => void;
}

interface GoogleMapsListener {
  remove(): void;
}

interface StreetViewPanoramaInstance {
  addListener(eventName: "status_changed", handler: () => void): GoogleMapsListener;
  getStatus(): string;
  setPano(panoId: string): void;
  setVisible(isVisible: boolean): void;
}

interface StreetViewPanoramaConstructor {
  new (
    container: HTMLElement,
    options?: {
      addressControl?: boolean;
      clickToGo?: boolean;
      disableDefaultUI?: boolean;
      enableCloseButton?: boolean;
      fullscreenControl?: boolean;
      linksControl?: boolean;
      motionTracking?: boolean;
      motionTrackingControl?: boolean;
      panControl?: boolean;
      scrollwheel?: boolean;
      showRoadLabels?: boolean;
      visible?: boolean;
      zoomControl?: boolean;
    },
  ): StreetViewPanoramaInstance;
}

interface StreetViewServiceConstructor {
  new (): {
    getPanorama(request: { pano: string }): Promise<unknown>;
  };
}

interface StreetViewLibrary {
  StreetViewPanorama: StreetViewPanoramaConstructor;
  StreetViewService: StreetViewServiceConstructor;
  StreetViewStatus: {
    OK: string;
    UNKNOWN_ERROR: string;
    ZERO_RESULTS: string;
  };
}

const GOOGLE_MAPS_CALLBACK = "__initGameStreetViewGoogleMaps";
const GOOGLE_MAPS_SCRIPT_SELECTOR = 'script[data-google-maps-loader="game-street-view"]';

let googleMapsApiPromise: Promise<GoogleMapsApi> | null = null;
let panoramaCandidatePromise: Promise<GooglePanoramaCandidate> | null = null;

function validateGooglePanoramaCandidate(candidate: unknown): GooglePanoramaCandidate {
  if (
    typeof candidate !== "object" || candidate === null ||
    !("provider" in candidate) || candidate.provider !== "google-street-view" ||
    !("panoId" in candidate) || typeof candidate.panoId !== "string" ||
    !("latitude" in candidate) || typeof candidate.latitude !== "number" ||
    !("longitude" in candidate) || typeof candidate.longitude !== "number"
  ) {
    throw new Error("The backend returned an invalid Street View panorama payload.");
  }

  return candidate as GooglePanoramaCandidate;
}

function loadGoogleMapsApi(apiKey: string): Promise<GoogleMapsApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  const googleWindow = window as GoogleMapsWindow;
  const resolveMapsApi = (): GoogleMapsApi => {
    const mapsApi = googleWindow.google?.maps;

    if (!mapsApi?.importLibrary) {
      throw new Error("Google Maps loaded without the importLibrary API.");
    }

    return mapsApi;
  };

  if (googleWindow.google?.maps?.importLibrary) {
    return Promise.resolve(googleWindow.google.maps);
  }

  if (googleMapsApiPromise) {
    return googleMapsApiPromise;
  }

  googleMapsApiPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      GOOGLE_MAPS_SCRIPT_SELECTOR,
    );

    const handleReady = () => {
      try {
        resolve(resolveMapsApi());
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Google Maps failed to initialize."),
        );
      }
    };

    const handleFailure = () => {
      delete googleWindow[GOOGLE_MAPS_CALLBACK];
      reject(new Error("Google Maps JavaScript API failed to load."));
    };

    googleWindow[GOOGLE_MAPS_CALLBACK] = () => {
      delete googleWindow[GOOGLE_MAPS_CALLBACK];
      handleReady();
    };

    if (existingScript) {
      if (existingScript.dataset.status === "loaded") {
        handleReady();
        return;
      }

      if (existingScript.dataset.status === "error") {
        handleFailure();
        return;
      }

      existingScript.addEventListener("load", handleReady, { once: true });
      existingScript.addEventListener("error", handleFailure, { once: true });
      return;
    }

    const params = new URLSearchParams({
      key: apiKey,
      loading: "async",
      callback: GOOGLE_MAPS_CALLBACK,
      v: "weekly",
      auth_referrer_policy: "origin",
    });

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "game-street-view";
    script.dataset.status = "loading";
    script.addEventListener("load", () => {
      script.dataset.status = "loaded";
    }, { once: true });
    script.onerror = () => {
      script.dataset.status = "error";
      handleFailure();
    };

    document.head.appendChild(script);
  });

  return googleMapsApiPromise;
}

function fetchPanoramaCandidate(
  apiService: ReturnType<typeof useApi>,
): Promise<GooglePanoramaCandidate> {
  if (panoramaCandidatePromise) {
    return panoramaCandidatePromise;
  }

  panoramaCandidatePromise = apiService
    .get<GooglePanoramaCandidate>("/google/panorama")
    .then(validateGooglePanoramaCandidate);

  return panoramaCandidatePromise;
}

function getStreetViewErrorMessage(status: string, unavailableStatus: string): string {
  if (status === unavailableStatus) {
    return "Google Street View is unavailable for the panorama returned by the backend.";
  }

  return "Google Street View could not render the selected panorama.";
}

const GameStreetViewComponent: React.FC<GameStreetViewProps> = ({
  panoramaId,
  onPanoramaLoaded,
}) => {
  const apiService = useApi();
  const panoramaContainerRef = React.useRef<HTMLDivElement | null>(null);
  const panoramaRef = React.useRef<StreetViewPanoramaInstance | null>(null);
  const panoramaListenerRef = React.useRef<GoogleMapsListener | null>(null);
  const onPanoramaLoadedRef = React.useRef(onPanoramaLoaded);
  const [state, setState] = React.useState<StreetViewState>({
    kind: "loading",
    title: "Loading Street View",
    message: "Requesting a panorama candidate from the backend.",
  });

  React.useEffect(() => {
    onPanoramaLoadedRef.current = onPanoramaLoaded;
  }, [onPanoramaLoaded]);

  React.useEffect(() => {
    let isCancelled = false;

    const initializeStreetView = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY;

      if (!apiKey) {
        setState({
          kind: "error",
          title: "Missing Google Maps API key",
          message:
            "Set NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY before loading the demo page.",
        });
        return;
      }

      const container = panoramaContainerRef.current;

      if (!container) {
        return;
      }

      try {
        setState({
          kind: "loading",
          title: "Loading Street View",
          message: panoramaId
            ? "Loading the saved panorama for this round."
            : "Requesting a panorama candidate from the backend.",
        });

        const candidate = panoramaId
          ? {
            provider: "google-street-view" as const,
            panoId: panoramaId,
            latitude: 0,
            longitude: 0,
          }
          : await fetchPanoramaCandidate(apiService);

        if (isCancelled) {
          return;
        }

        if (!panoramaId) {
          onPanoramaLoadedRef.current?.(candidate);
        }

        setState({
          kind: "loading",
          title: "Loading Street View",
          message: "Loading the Google Maps JavaScript API.",
        });

        const mapsApi = await loadGoogleMapsApi(apiKey);

        if (isCancelled) {
          return;
        }

        setState({
          kind: "loading",
          title: "Loading Street View",
          message: "Initializing the panorama viewer.",
        });

        const { StreetViewPanorama, StreetViewService, StreetViewStatus } =
          await mapsApi.importLibrary("streetView");

        if (isCancelled) {
          return;
        }

        const streetViewService = new StreetViewService();
        await streetViewService.getPanorama({ pano: candidate.panoId });

        if (isCancelled) {
          return;
        }

        const panorama = new StreetViewPanorama(container, {
          disableDefaultUI: true,
          addressControl: false,
          clickToGo: false,
          enableCloseButton: false,
          fullscreenControl: false,
          linksControl: false,
          motionTracking: false,
          motionTrackingControl: false,
          panControl: false,
          // Lock the viewpoint to a single panorama while still allowing rotation.
          scrollwheel: false,
          showRoadLabels: false,
          visible: true,
          zoomControl: false,
        });

        panoramaRef.current = panorama;

        await new Promise<void>((resolve, reject) => {
          const timeoutId = globalThis.setTimeout(() => {
            panoramaListenerRef.current?.remove();
            panoramaListenerRef.current = null;
            reject(new Error("Google Street View timed out while opening the panorama."));
          }, 10000);

          panoramaListenerRef.current = panorama.addListener("status_changed", () => {
            const nextStatus = panorama.getStatus();

            if (nextStatus === StreetViewStatus.OK) {
              globalThis.clearTimeout(timeoutId);
              panoramaListenerRef.current?.remove();
              panoramaListenerRef.current = null;
              resolve();
              return;
            }

            if (
              nextStatus === StreetViewStatus.ZERO_RESULTS ||
              nextStatus === StreetViewStatus.UNKNOWN_ERROR
            ) {
              globalThis.clearTimeout(timeoutId);
              panoramaListenerRef.current?.remove();
              panoramaListenerRef.current = null;
              reject(new Error(getStreetViewErrorMessage(
                nextStatus,
                StreetViewStatus.ZERO_RESULTS,
              )));
            }
          });

          panorama.setPano(candidate.panoId);

          if (panorama.getStatus() === StreetViewStatus.OK) {
            globalThis.clearTimeout(timeoutId);
            panoramaListenerRef.current?.remove();
            panoramaListenerRef.current = null;
            resolve();
          }
        });

        if (isCancelled) {
          return;
        }

        setState({ kind: "ready" });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = error instanceof Error
          ? error.message
          : "Street View failed to initialize.";

        setState({
          kind: "error",
          title: "Street View unavailable",
          message,
        });
      }
    };

    void initializeStreetView();

    return () => {
      isCancelled = true;
      panoramaListenerRef.current?.remove();
      panoramaListenerRef.current = null;
      panoramaRef.current?.setVisible(false);
      panoramaRef.current = null;

      if (panoramaContainerRef.current) {
        panoramaContainerRef.current.innerHTML = "";
      }
    };
  }, [apiService, panoramaId]);

  return (
    <div className="game-street-view-shell">
      <div
        ref={panoramaContainerRef}
        className={`game-street-view-canvas ${
          state.kind === "ready" ? "game-street-view-canvas-ready" : ""
        }`}
        aria-hidden={state.kind !== "ready"}
      />

      {state.kind !== "ready" && (
        <div
          className={`game-street-view-state ${
            state.kind === "error" ? "game-street-view-state-error" : ""
          }`}
          role={state.kind === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <span className="game-street-view-state-eyebrow">Google Street View</span>
          <strong className="game-street-view-state-title">{state.title}</strong>
          <p className="game-street-view-state-message">{state.message}</p>
        </div>
      )}
    </div>
  );
};

const GameStreetView = React.memo(GameStreetViewComponent);

export default GameStreetView;
