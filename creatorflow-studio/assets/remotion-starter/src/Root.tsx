import {Composition} from "remotion";
import {CreatorFlowVideo} from "./CreatorFlowVideo";
import episode from "./data/episode.json";
import continuousDemo from "./data/continuous-demo.json";
import profile from "./data/profile.json";
import type {CreatorProfile, Episode} from "./types";

const typedEpisode = episode as Episode;
const typedProfile = profile as CreatorProfile;
const typedContinuousDemo = continuousDemo as Episode;

export const RemotionRoot = () => (
  <>
    <Composition
      id="CreatorFlowVideo"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEpisode.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{episode: typedEpisode, profile: typedProfile}}
    />
    <Composition
      id="ContinuousStageDemo"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedContinuousDemo.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{episode: typedContinuousDemo, profile: typedProfile}}
    />
  </>
);
