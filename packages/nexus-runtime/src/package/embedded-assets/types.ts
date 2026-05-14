export interface EmbeddedPackageAsset {
  contentBase64: string;
  mode?: number;
  path: string;
}

export interface EmbeddedPackageAssetsModule {
  embeddedPackageAssetVersion: string;
  embeddedPackageAssets: EmbeddedPackageAsset[];
}
