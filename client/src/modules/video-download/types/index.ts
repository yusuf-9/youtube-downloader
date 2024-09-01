export type RegisterVideoRequestResponse = {
  data: string;
  message: string;
};

export type PollVideoStatusResponse = {
  status: string;
  message?: string;
  data?: string;
};

export type Formats = {
  video: {
    resolutions: string[];
    extensions: string[];
  };
  audio: {
    resolutions: string[];
    extensions: string[];
  };
};

export type FetchMetaDataResponse = {
  data: {
    title: string;
    duration: number;
    thumbnail: string;
    webpage_url: string;
    formats: string[];
  };
};

export type MetaData = {
  title: string;
  duration: number;
  thumbnail: string;
  webpage_url: string;
  formats: Formats;
};
