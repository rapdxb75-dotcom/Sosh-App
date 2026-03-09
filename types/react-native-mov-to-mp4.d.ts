declare module "react-native-mov-to-mp4" {
  const MovToMp4: {
    convertMovToMp4: (inputPath: string, outputPath: string) => Promise<string>;
  };
  export default MovToMp4;
}
