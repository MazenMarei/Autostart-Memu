interface Config {
    numberOFDevices: number | "auto"
    delay: number
}


export default  {
    numberOFDevices: "auto", // or type a number
    delay: 1000 * 60 * 5,
} satisfies Config;