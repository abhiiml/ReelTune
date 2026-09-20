// Allow importing CSS files (used by NativeWind global.css)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
