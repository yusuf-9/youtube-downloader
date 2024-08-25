export type RegisterVideoRequestResponse = {
  data: string;
  message: string;
};

export type PollVideoStatusResponse = {
  status: string;
  message?: string;
  data?: string;
};

export type FetchMetaDataResponse = {
  data: {
    title: string;
    duration: number;
    thumbnail: string;
    webpage_url: string;
    formats: any[];
  };
};

export type Format = {
  id: string;
  fileSize?: string;
  resolution: string;
};

export type MetaData = {
  title: string;
  duration: number;
  thumbnail: string;
  webpage_url: string;
  formats: Record<
    string,
    Format[]
  >;
};
