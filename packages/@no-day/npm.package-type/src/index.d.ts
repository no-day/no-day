export type NpmPackage = {
  name: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  module?: string;
};
