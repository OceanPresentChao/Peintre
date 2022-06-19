export interface PeintreOptions {
    /**
     * Whether use pressure support or not
     * @default false
     */
    pressure?: boolean
    /**
     * Language to use.
     * @default 'en'
     */
    lang?: string
    /**
     * min context linewidth
     *
     * @default 1
     */
    minLine?: number
    /**
     * max context linewidth
     *
     * @default 500
     */
    maxLine?: number
    /**
    * canvas width
    *
    * @default 800
    */
    width?: number
    /**
     * canvas height
     *
     * @default 600
     */
    height?: number
}