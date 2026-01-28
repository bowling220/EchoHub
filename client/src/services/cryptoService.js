// Encryption protocol for EchoHub
// Uses Web Crypto API for local-only key management

export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
        publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
        privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey)))
    };
};

export const encrypt = async (text, publicKeyBase64) => {
    try {
        const binaryDerString = window.atob(publicKeyBase64);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        const publicKey = await window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );

        const encoded = new TextEncoder().encode(text);
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            encoded
        );

        return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    } catch (e) {
        console.error("Encryption failed", e);
        return text; // Fallback
    }
};

export const decrypt = async (encryptedBase64, privateKeyBase64) => {
    try {
        const binaryDerString = window.atob(privateKeyBase64);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["decrypt"]
        );

        const encrypted = window.atob(encryptedBase64);
        const binaryEncrypted = new Uint8Array(encrypted.length);
        for (let i = 0; i < encrypted.length; i++) {
            binaryEncrypted[i] = encrypted.charCodeAt(i);
        }

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            binaryEncrypted
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        // If decryption fails, it might not be encrypted or wrong key
        return null;
    }
};
