import { ConfigService } from "@nestjs/config";
import { AccessGroupFromGraphQLApiService } from "./access-group-from-graphql-api-call.service";
import { AccessGroupFromMultipleProvidersService } from "./access-group-from-multiple-providers.service";
import { AccessGroupFromPayloadService } from "./access-group-from-payload.service";
import { AccessGroupFromStaticValuesService } from "./access-group-from-static-values.service";
import { AccessGroupService } from "./access-group.service";

export const accessGroupServiceFactory = {
  provide: AccessGroupService,
  useFactory: (configService: ConfigService) => {
    const site = configService.get<string>("site");
    if (site === "ESS") {
      return getEssAccessGroupService(configService);
    } else {
      return new AccessGroupFromPayloadService(configService);
    }
  },
  inject: [ConfigService],
};

function getEssAccessGroupService(configService: ConfigService) {
  const fromApi = getEssAccessGroupFromGQLApiService(configService);
  const fromStatic = new AccessGroupFromStaticValuesService([]);

  const fromMultiple = new AccessGroupFromMultipleProvidersService([
    fromApi,
    fromStatic,
  ]);

  return fromMultiple;
}
function getEssAccessGroupFromGQLApiService(configService: ConfigService) {
  const url = configService.get<string>("accessGroupService.apiUrl");
  const token = configService.get<string>("accessGroupService.token");

  if (!url) throw new Error("No url for accessGroupService");
  if (!token) throw new Error("No token for accessGroupService");

  const authHeader = `Bearer ${token}`;
  const headers = {
    authorization: authHeader,
  };
  const query = `
    userByOIDCSub(oidcSub: "{{oidcSub}}"){
      proposals {
        proposalId
      }
    }`;

  const responseProcessor = (response: {
    data: {
      userByOIDCSub?: { proposals?: Array<{ proposalId: string }> };
    };
  }) => {
    const proposals = response.data.userByOIDCSub?.proposals;
    if (!proposals) return [];
    return proposals.map((proposal) => proposal.proposalId);
  };

  return new AccessGroupFromGraphQLApiService(
    query,
    url,
    headers,
    responseProcessor,
  );
}
