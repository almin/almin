// MIT © 2017 azu
/**
 * @private
 */
export interface ContextConfigArgs {
    strict?: boolean;
    performanceProfile?: boolean;
}

export class ContextConfig {
    // strict mode
    strict: boolean = false;
    // performance profile
    performanceProfile: boolean = false;

    constructor(options: ContextConfigArgs) {
        this.strict = options.strict !== undefined ? options.strict : false;
        this.performanceProfile = options.performanceProfile !== undefined ? options.performanceProfile : false;
    }
}
