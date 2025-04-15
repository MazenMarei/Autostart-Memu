interface Config {
    numberOFDevices: number | "auto"
    delay: number
}


export default  {
    numberOFDevices: "auto",
    delay: 1000 * 60 * 5,
} satisfies Config;