class FormatsService {
  static validateVideoResolution(resolution: string) {
    const formatPatten = /^\d+x\d+$/;
    return formatPatten.test(resolution);
  }
}

export default FormatsService;
