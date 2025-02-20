import { CyType } from "./enums";
import getSecurityKey from "./get-security-key";
import getSalt from "./get_salt";

type CyProps = {
    key: string;
    salt: number | undefined;
}

const getCyProps = (cyType: CyType): Promise<CyProps> => {
    return new Promise((resolve, reject) => {
        getSecurityKey(cyType).then((key) => {
            getSalt(cyType).then((salt) => {
                resolve({
                    key,
                    salt
                })
            }).catch((error) => {
                reject(new Error(error.message, { cause: error.cause }));
            });
        }).catch((error) => {
            reject(new Error(error.message, { cause: error.cause }));
        });
    })
}

export {
    CyProps,
    getCyProps
};