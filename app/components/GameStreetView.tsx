"use client";

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
  panoramaId: string | null;
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
const GOOGLE_STREET_VIEW_IMAGERY_ERROR_MESSAGE =
  "Google Street View imagery could not be loaded. Google may be rate limiting the panorama tiles. Please try again later.";
const STREET_VIEW_IMAGERY_RENDER_GRACE_PERIOD_MS = 5000;

let googleMapsApiPromise: Promise<GoogleMapsApi> | null = null;

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

function getStreetViewErrorMessage(status: string, unavailableStatus: string): string {
  if (status === unavailableStatus) {
    return "Google Street View is unavailable for the panorama returned by the backend.";
  }

  return "Google Street View could not render the selected panorama.";
}

function getResourceUrlFromEventTarget(target: EventTarget): string | null {
  if (target instanceof HTMLImageElement) {
    return target.currentSrc || target.src || null;
  }

  if (
    target instanceof HTMLScriptElement ||
    target instanceof HTMLIFrameElement ||
    target instanceof HTMLSourceElement ||
    target instanceof HTMLTrackElement
  ) {
    return target.src || null;
  }

  if (target instanceof HTMLLinkElement) {
    return target.href || null;
  }

  return null;
}

function isGoogleStreetViewImageryHost(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  return normalizedHostname === "ggpht.com" ||
    normalizedHostname.endsWith(".ggpht.com");
}

function isGoogleStreetViewImageryUrl(resourceUrl: string): boolean {
  try {
    return isGoogleStreetViewImageryHost(
      new URL(resourceUrl, globalThis.location.href).hostname,
    );
  } catch {
    return false;
  }
}

function isStreetViewImageryLoadError(
  event: Event,
  container: HTMLElement,
): boolean {
  const target = event.target;

  if (!(target instanceof Node) || !container.contains(target)) {
    return false;
  }

  const resourceUrl = getResourceUrlFromEventTarget(target);

  if (!resourceUrl) {
    return false;
  }

  return isGoogleStreetViewImageryUrl(resourceUrl);
}

function isFailedStreetViewResourceTiming(
  entry: PerformanceEntry,
): boolean {
  if (!(entry instanceof PerformanceResourceTiming)) {
    return false;
  }

  const responseStatus = (entry as PerformanceResourceTiming & {
    responseStatus?: number;
  }).responseStatus;

  return isGoogleStreetViewImageryUrl(entry.name) &&
    typeof responseStatus === "number" &&
    responseStatus >= 400;
}

function getStreetViewImageryImages(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll("img")).filter((image) => {
    return isGoogleStreetViewImageryUrl(image.currentSrc || image.src);
  });
}

function hasLoadedStreetViewImagery(container: HTMLElement): boolean {
  return getStreetViewImageryImages(container).some((image) => {
    return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  });
}

const GameStreetViewComponent: React.FC<GameStreetViewProps> = ({
  panoramaId,
}) => {
  const panoramaContainerRef = React.useRef<HTMLDivElement | null>(null);
  const panoramaRef = React.useRef<StreetViewPanoramaInstance | null>(null);
  const panoramaListenerRef = React.useRef<GoogleMapsListener | null>(null);
  const [state, setState] = React.useState<StreetViewState>({
    kind: "loading",
    title: "Loading Street View",
    message: "Loading the saved panorama for this round.",
  });

  React.useEffect(() => {
    let isCancelled = false;
    let hasStreetViewImageryLoadError = false;
    let hasObservedStreetViewImageryRequest = false;
    let handleResourceError: ((event: Event) => void) | null = null;
    let resourceTimingObserver: PerformanceObserver | null = null;
    let streetViewContainer: HTMLDivElement | null = null;
    let imageryRenderWatchdogId: ReturnType<typeof globalThis.setTimeout> | null = null;

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

      if (!panoramaId) {
        setState({
          kind: "error",
          title: "Missing panorama",
          message: "This round does not include a Street View panorama ID.",
        });
        return;
      }

      const container = panoramaContainerRef.current;

      if (!container) {
        return;
      }

      streetViewContainer = container;

      const surfaceStreetViewImageryLoadError = () => {
        if (isCancelled || hasStreetViewImageryLoadError) {
          return;
        }

        hasStreetViewImageryLoadError = true;
        setState({
          kind: "error",
          title: "Street View unavailable",
          message: GOOGLE_STREET_VIEW_IMAGERY_ERROR_MESSAGE,
        });
      };

      handleResourceError = (event: Event) => {
        if (
          isCancelled ||
          hasStreetViewImageryLoadError ||
          !isStreetViewImageryLoadError(event, container)
        ) {
          return;
        }

        hasObservedStreetViewImageryRequest = true;
        surfaceStreetViewImageryLoadError();
      };
      document.addEventListener("error", handleResourceError, true);
      globalThis.addEventListener("error", handleResourceError, true);

      if ("PerformanceObserver" in globalThis) {
        resourceTimingObserver = new PerformanceObserver((list) => {
          const resourceEntries = list.getEntries();

          if (resourceEntries.some((entry) => {
            return isGoogleStreetViewImageryUrl(entry.name);
          })) {
            hasObservedStreetViewImageryRequest = true;
          }

          if (resourceEntries.some(isFailedStreetViewResourceTiming)) {
            surfaceStreetViewImageryLoadError();
          }
        });
        resourceTimingObserver.observe({
          type: "resource",
          buffered: true,
        });
      }

      try {
        setState({
          kind: "loading",
          title: "Loading Street View",
          message: "Loading the saved panorama for this round.",
        });

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
        await streetViewService.getPanorama({ pano: panoramaId });

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

          panorama.setPano(panoramaId);

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

        if (hasStreetViewImageryLoadError) {
          return;
        }

        setState({ kind: "ready" });

        imageryRenderWatchdogId = globalThis.setTimeout(() => {
          const googleImageryImages = getStreetViewImageryImages(container);
          const hasStreetViewImageryEvidence =
            hasObservedStreetViewImageryRequest || googleImageryImages.length > 0;

          if (
            !isCancelled &&
            !hasStreetViewImageryLoadError &&
            hasStreetViewImageryEvidence &&
            !hasLoadedStreetViewImagery(container)
          ) {
            surfaceStreetViewImageryLoadError();
          }
        }, STREET_VIEW_IMAGERY_RENDER_GRACE_PERIOD_MS);
      } catch (error) {
        if (isCancelled || hasStreetViewImageryLoadError) {
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
      if (handleResourceError) {
        document.removeEventListener("error", handleResourceError, true);
        globalThis.removeEventListener("error", handleResourceError, true);
      }
      resourceTimingObserver?.disconnect();
      if (imageryRenderWatchdogId !== null) {
        globalThis.clearTimeout(imageryRenderWatchdogId);
      }
      panoramaListenerRef.current?.remove();
      panoramaListenerRef.current = null;
      panoramaRef.current?.setVisible(false);
      panoramaRef.current = null;

      if (streetViewContainer) {
        streetViewContainer.innerHTML = "";
      }
    };
  }, [panoramaId]);

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
