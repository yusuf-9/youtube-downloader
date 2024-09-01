import { FetchMetaDataResponse, MetaData } from "../types";

class FormatsService {
  static formatFormatOptions(formats: FetchMetaDataResponse["data"]["formats"]): MetaData["formats"] {
    const formatPatten = /^\d+x\d+$/;

    const videoResolutions = formats?.reduce((acc: string[], format) => {
      if (formatPatten.test(format)) {
        acc.push(format);
      }

      return acc;
    }, []);

    const formatOptions = {
      video: {
        resolutions: ["best quality", ...videoResolutions],
        extensions: ["mp4", "webm", "mov", "wmv"],
      },
      audio: {
        resolutions: ["best quality", "320k", "192k", "128k"],
        extensions: ["mp3", "wav", "aac"],
      }
    };
    return formatOptions;
  }
}

export default FormatsService;
