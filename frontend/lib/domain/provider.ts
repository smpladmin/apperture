export enum Provider {
  GOOGLE = 'google',
  MIXPANEL = 'mixpanel',
  CLEVER = 'clever',
}
export namespace Provider {
  export function getDisplayName(provider: Provider): string {
    if (provider == Provider.GOOGLE) return 'GA';
    else return capitalizeFirstLetter(provider);
  }
}

function capitalizeFirstLetter(provider: string): string {
  const capitalized = provider.charAt(0).toUpperCase() + provider.slice(1);
  return capitalized;
}
