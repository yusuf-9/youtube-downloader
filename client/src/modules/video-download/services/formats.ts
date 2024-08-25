import { convertBytesToReadablyFormat } from "@/common/utils";
import { FetchMetaDataResponse, MetaData } from "../types";

class FormatsService {
  static formatFormatOptions(formats: FetchMetaDataResponse["data"]["formats"]): MetaData["formats"] {
    const formattedFormats: MetaData["formats"] = formats?.reduce((acc, format) => {
      const formatItem = {
        resolution: format?.resolution,
        id: format?.format_id,
        fileSize: convertBytesToReadablyFormat(format?.filesize ?? format?.filesize_approx),
      };
      if (!acc[format?.ext]) acc[format?.ext] = [formatItem];
      else acc[format?.ext].push(formatItem);

      return acc;
    }, {});

    // Sort the formattedFormats object by the number of items in each key's array
    const sortedFormattedFormats = Object.fromEntries(
      Object.entries(formattedFormats).sort(([, a], [, b]) => b.length - a.length)
    );

    return sortedFormattedFormats;
  }
}

export default FormatsService;
