import { DefinitionType } from "../Type/DefinitionType";

/**
 * Identifies the longest prefix common to all inputs and returns it.
 */
function longestCommonPrefix(inputs: string[]): string {
    let prefix = inputs.reduce((acc, str) => str.length < acc.length ? str : acc);

    for (let str of inputs) {
        while (str.slice(0, prefix.length) != prefix) {
            prefix = prefix.slice(0, -1);
        }
    }

    return prefix;
}

/**
 * Returns an unambiguous name for the given definition.
 *
 * If the definition's name doesn't cause conflicts, its behavior is identical to getName().
 * Otherwise, it uses the definition's file name to generate an unambiguous name.
 */
export function unambiguousName(child: DefinitionType, isRoot: boolean, peers: DefinitionType[]): string {
    // Root definitions or unambiguous ones get to keep their name.
    if (peers.length === 1 || isRoot) {
        return child.getName();
    }

    // "intermediate" type
    if (!child.getType().getSrcFileName()) {
        return child.getName();
    }

    // filter unique peers to be those that have srcFileNames.
    // Intermediate Types - AnnotationTypes, UnionTypes, do not have sourceFileNames
    const uniques = peers.filter(peer => peer.getType().getSrcFileName());
    if (uniques.length === 1) {
        return uniques[0].getName();
    }

    let pathIndex = -1;
    const srcPaths = uniques.map((peer, count) => {
        pathIndex = child === peer ? count : pathIndex;
        return peer.getType().getSrcFileName()!;
    });

    const commonPrefixLength = longestCommonPrefix(srcPaths).length;
    const uniquePath = srcPaths[pathIndex]
        .substring(commonPrefixLength) // remove the common prefix
        .replace(/\//g, "__")          // replace "/" by double underscores
        .replace(/\.[^.]+$/, "");      // strip the extension

    return `${uniquePath}-${child.getName()}`;
}
