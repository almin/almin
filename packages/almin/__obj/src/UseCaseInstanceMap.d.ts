import MapLike from "map-like";
import { UseCaseLike } from "./UseCaseLike";
import { UseCaseExecutor } from "./UseCaseExecutor";
/**
 * This Map maintains a mapping instance of UseCase
 * A UseCase will execute and add it to this map.
 * A UseCase was completed and remove it from this map.
 */
export declare const UseCaseInstanceMap: MapLike<UseCaseLike, UseCaseExecutor>;
