import {Composition} from "remotion";
import {CreatorFlowVideo} from "./CreatorFlowVideo";
import profile from "./data/profile.json";
import type {CreatorProfile, Episode} from "./types";
import ep013V01 from "./data/ep013-v01-episode.json";
import ep013V01Captions from "./data/ep013-v01-captions.json";
import ep013V01Words from "./data/ep013-v01-words.json";
import ep012V01 from "./data/ep012-v01-episode.json";
import ep012V01Captions from "./data/ep012-v01-captions.json";
import ep012V01Words from "./data/ep012-v01-words.json";
import ep011V02 from "./data/ep011-v02-episode.json";
import ep011V02Captions from "./data/ep011-v02-captions.json";
import ep011V02Words from "./data/ep011-v02-words.json";
import ep009V01 from "./data/ep009-v01-episode.json";
import ep009V01Captions from "./data/ep009-v01-captions.json";
import ep009V01Words from "./data/ep009-v01-words.json";
import ep010V01 from "./data/ep010-v01-episode.json";
import ep010V01Captions from "./data/ep010-v01-captions.json";
import ep010V01Words from "./data/ep010-v01-words.json";
import ep008V01 from "./data/ep008-v01-episode.json";
import ep008V01Captions from "./data/ep008-v01-captions.json";
import ep008V01Words from "./data/ep008-v01-words.json";
import ep007V01 from "./data/ep007-v01-episode.json";
import ep007V01Captions from "./data/ep007-v01-captions.json";
import ep007V01Words from "./data/ep007-v01-words.json";
import ep006V03 from "./data/ep006-v03-episode.json";
import ep006V03Captions from "./data/ep006-v03-captions.json";
import ep006V03Words from "./data/ep006-v03-words.json";

const typedProfile = profile as CreatorProfile;
const typedEp013V01 = ep013V01 as Episode;
const typedEp012V01 = ep012V01 as Episode;
const typedEp011V02 = ep011V02 as Episode;
const typedEp009V01 = ep009V01 as Episode;
const typedEp010V01 = ep010V01 as Episode;
const typedEp008V01 = ep008V01 as Episode;
const typedEp007V01 = ep007V01 as Episode;
const typedEp006V03 = ep006V03 as Episode;

export const RemotionRoot = () => (
  <>
    <Composition
      id="CreatorFlowVideo"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp013V01.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp013V01,
        profile: typedProfile,
        captionData: ep013V01Captions,
        wordData: ep013V01Words,
      }}
    />
    <Composition
      id="EP013V01"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp013V01.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp013V01,
        profile: typedProfile,
        captionData: ep013V01Captions,
        wordData: ep013V01Words,
      }}
    />
    <Composition
      id="EP012V01"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp012V01.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp012V01,
        profile: typedProfile,
        captionData: ep012V01Captions,
        wordData: ep012V01Words,
      }}
    />
    <Composition
      id="EP011V02"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp011V02.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp011V02,
        profile: typedProfile,
        captionData: ep011V02Captions,
        wordData: ep011V02Words,
      }}
    />
    <Composition
      id="EP009V01"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp009V01.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp009V01,
        profile: typedProfile,
        captionData: ep009V01Captions,
        wordData: ep009V01Words,
      }}
    />
    <Composition
      id="EP010V01"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp010V01.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp010V01,
        profile: typedProfile,
        captionData: ep010V01Captions,
        wordData: ep010V01Words,
      }}
    />
    <Composition
      id="EP008V01"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp008V01.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp008V01,
        profile: typedProfile,
        captionData: ep008V01Captions,
        wordData: ep008V01Words,
      }}
    />
    <Composition
      id="EP007V01"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp007V01.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp007V01,
        profile: typedProfile,
        captionData: ep007V01Captions,
        wordData: ep007V01Words,
      }}
    />
    <Composition
      id="EP006V03"
      component={CreatorFlowVideo}
      width={typedProfile.production.width}
      height={typedProfile.production.height}
      fps={typedProfile.production.fps}
      durationInFrames={Math.ceil((typedEp006V03.durationMs / 1000) * typedProfile.production.fps)}
      defaultProps={{
        episode: typedEp006V03,
        profile: typedProfile,
        captionData: ep006V03Captions,
        wordData: ep006V03Words,
      }}
    />
  </>
);
