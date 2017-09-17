// MIT © 2017 azu
import { AlminPerfMarkerAbstract } from "./AlminAbstractPerfMarker";

let debugTool: AlminPerfMarkerAbstract | undefined;
if (process.env.NODE_ENV !== "production") {
    const AlminPerfMarker = require("./AlminPerfMarker").AlminPerfMarker;
    debugTool = new AlminPerfMarker();
}
export default { debugTool };
